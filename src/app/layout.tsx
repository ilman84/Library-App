import type { Metadata } from 'next';
import { Quicksand, Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'sonner';

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Booky - Library Management System',
  description: 'Modern library management system for digital book borrowing',
  icons: {
    icon: '/images/booky-logo.svg',
    shortcut: '/images/booky-logo.svg',
    apple: '/images/booky-logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/images/booky-logo.svg' type='image/svg+xml' />
        <link
          rel='shortcut icon'
          href='/images/booky-logo.svg'
          type='image/svg+xml'
        />
      </head>
      <body
        className={`${quicksand.variable} ${inter.variable} font-quicksand antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
