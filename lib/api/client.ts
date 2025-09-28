import { API_CONFIG, ApiResponse } from './config';

// API Client class for handling HTTP requests
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    timeout: number = API_CONFIG.TIMEOUT
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Set authentication token
  setAuthToken(token: string) {
    console.log(
      '🔑 Setting auth token:',
      token ? `${token.substring(0, 20)}...` : 'null'
    );
    this.authToken = token;
  }

  // Remove authentication token
  clearAuthToken() {
    this.authToken = null;
  }

  // Get default headers
  private getHeaders(
    customHeaders: Record<string, string> = {}
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: '*/*',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(options.headers as Record<string, string>),
    };

    console.log('🌐 Making API request:', {
      url,
      hasToken: !!this.authToken,
      tokenPreview: this.authToken
        ? `${this.authToken.substring(0, 20)}...`
        : 'none',
      headers: config.headers,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Read response as text first to better handle non-JSON (e.g., HTML error pages)
      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      // Try to parse JSON only when appropriate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsed: any = null;
      if (
        contentType.includes('application/json') ||
        rawText.trim().startsWith('{') ||
        rawText.trim().startsWith('[')
      ) {
        try {
          parsed = JSON.parse(rawText);
        } catch {
          // Fall through to error handling below
        }
      }

      if (!response.ok) {
        const messageFromJson =
          parsed && typeof parsed === 'object'
            ? parsed.message || parsed.error || null
            : null;
        const baseMessage =
          messageFromJson || `HTTP ${response.status} ${response.statusText}`;

        // Add status code to error message for better error handling
        const error = new Error(baseMessage);
        (error as any).status = response.status;
        throw error;
      }

      // Successful but non-JSON body
      if (!parsed) {
        // 204 No Content is acceptable
        if (response.status === 204) {
          return {
            success: true,
            message: 'No Content',
          } as unknown as ApiResponse<T>;
        }
        throw new Error(
          `Expected JSON response but received '${
            contentType || 'unknown'
          }'. URL: ${url}. Body: ${rawText.slice(0, 300)}`
        );
      }

      return parsed as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create default API client instance
export const apiClient = new ApiClient();
