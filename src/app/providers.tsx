'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ReduxProvider from '@/store/ReduxProvider';

export default function Providers({ children }: { children: ReactNode }) {
  // Ensure QueryClient is created on client and not re-created on re-render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
              console.log('🔄 Query retry attempt:', failureCount, error);
              // Don't retry on 4xx errors except 408 (timeout)
              if (error instanceof Error && error.message.includes('40')) {
                const statusMatch = error.message.match(/status: (\d+)/);
                if (statusMatch) {
                  const status = parseInt(statusMatch[1]);
                  if (status >= 400 && status < 500 && status !== 408) {
                    return false;
                  }
                }
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      })
  );

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
