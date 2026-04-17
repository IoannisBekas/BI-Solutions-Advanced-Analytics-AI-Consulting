interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {},
): Promise<Response> {
  const { retries = 3, delay = 500, backoff = 2, onRetry } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok || response.status < 500) return response;
      // Server error — retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    if (attempt < retries) {
      onRetry?.(attempt + 1, lastError!);
      await new Promise(r => setTimeout(r, delay * Math.pow(backoff, attempt)));
    }
  }

  throw lastError ?? new Error('Fetch failed after retries');
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
  retryOptions?: RetryOptions,
): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };
  return fetchWithRetry(path, { ...init, headers }, retryOptions);
}
