# API Client Patterns

## Typed fetch wrapper

Create a reusable, typed HTTP client for CLI use:

```typescript
import type { ResponseLike } from 'bun';

interface ApiResponse<T> {
  data?: T;
  error?: { message: string; code: string };
  status: number;
}

class ApiClient {
  constructor(
    private baseUrl: string,
    private token?: string,
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseUrl).toString();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      
      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
        status: response.status,
      };
    } catch (error) {
      return {
        error: {
          message: (error as Error).message,
          code: 'NETWORK_ERROR',
        },
        status: 0,
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}

export const createApiClient = (baseUrl: string, token?: string) => {
  return new ApiClient(baseUrl, token);
};
```

## Error handling

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      headers: { 'Authorization': `Bearer ${this.token}` },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.message || `API error: ${response.statusText}`,
        response.status,
        error.code,
      );
    }
    
    return response.json();
  }
}

// Usage
try {
  const data = await apiClient.get('/solutions');
  console.log('Success:', data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      console.error('Unauthorized — token may have expired');
      // Offer to re-authenticate
    } else if (error.status === 404) {
      console.error('Not found:', error.message);
    } else {
      console.error(`API error (${error.status}):`, error.message);
    }
  } else {
    console.error('Network error:', (error as Error).message);
  }
  process.exit(1);
}
```

## Retry logic for transient failures

```typescript
class ApiClient {
  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retries = 3,
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(new URL(path, this.baseUrl), {
          method,
          headers: { 'Authorization': `Bearer ${this.token}` },
          body: body ? JSON.stringify(body) : undefined,
        });
        
        if (response.status === 429 || response.status >= 500) {
          // Rate limit or server error — retry
          if (attempt < retries - 1) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
        }
        
        if (!response.ok) {
          throw new ApiError(response.statusText, response.status);
        }
        
        return response.json();
      } catch (error) {
        if (attempt === retries - 1) throw error;
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

## Authorization and token refresh

```typescript
class ApiClient {
  private token: string;
  private refreshUrl: string;
  private refreshToken: string;

  async request<T>(...): Promise<T> {
    try {
      return await this.doRequest<T>(...);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token expired — refresh and retry
        await this.refreshAccessToken();
        return this.doRequest<T>(...);
      }
      throw error;
    }
  }

  private async refreshAccessToken() {
    const response = await fetch(this.refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token');
      throw new Error('Session expired — please login again');
    }

    const data = await response.json();
    this.token = data.access_token;
  }
}
```

## Pagination helper

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

class ApiClient {
  async *fetchAll<T>(path: string, perPage = 50) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(path, this.baseUrl);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('per_page', perPage.toString());

      const response: PaginatedResponse<T> = await this.get(url.pathname);
      
      for (const item of response.items) {
        yield item;
      }

      hasMore = page * perPage < response.total;
      page++;
    }
  }
}

// Usage with async iteration
for await (const solution of apiClient.fetchAll('/solutions')) {
  console.log(solution);
}
```

## Request logging (debug mode)

```typescript
class ApiClient {
  constructor(
    private baseUrl: string,
    private token: string,
    private debug = false,
  ) {}

  private async request<T>(...): Promise<T> {
    if (this.debug) {
      console.error(`[DEBUG] ${method} ${url.toString()}`);
    }

    const response = await fetch(url, { ... });
    
    if (this.debug) {
      console.error(`[DEBUG] Response: ${response.status}`);
      if (!response.ok) {
        const body = await response.text();
        console.error(`[DEBUG] Error body: ${body}`);
      }
    }
    
    return response.json();
  }
}

// Enable with --debug flag
const apiClient = createApiClient(
  config.get('apiUrl'),
  config.get('apiKey'),
  process.env.DEBUG === 'true',
);
```

## Request timeout

```typescript
class ApiClient {
  private timeout = 30000; // 30 seconds

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(new URL(path, this.baseUrl), {
        method,
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      return response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```
"