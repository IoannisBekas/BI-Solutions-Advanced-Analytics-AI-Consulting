import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from './fetchWithRetry';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns response on first successful call', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok', { status: 200 })));
    const res = await fetchWithRetry('/api/test');
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on server error and succeeds', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response('error', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const res = await fetchWithRetry('/api/test', undefined, { retries: 2, delay: 10 });
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 4xx errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('bad request', { status: 400 })));
    const res = await fetchWithRetry('/api/test', undefined, { retries: 3, delay: 10 });
    expect(res.status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await expect(fetchWithRetry('/api/test', undefined, { retries: 2, delay: 10 })).rejects.toThrow('Network error');
    expect(fetch).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('calls onRetry callback', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 })));
    const onRetry = vi.fn();
    await fetchWithRetry('/api/test', undefined, { retries: 2, delay: 10, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });
});
