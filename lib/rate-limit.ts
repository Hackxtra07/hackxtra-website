/**
 * Lightweight in-memory IP rate limiter.
 *
 * Works in Next.js API routes (both serverless and edge-compatible).
 * NOTE: On serverless/Vercel each function instance has its own in-memory store,
 * so this is "best-effort" per-instance protection. It stops the vast majority
 * of abuse without requiring Redis.
 *
 * Usage:
 *   const limited = rateLimit(ip, 'login', { limit: 5, windowMs: 60_000 });
 *   if (limited) return createErrorResponse('Too many attempts', 429);
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Module-level store — shared across requests within the same instance
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
    }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
    /** Max allowed requests in window */
    limit: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

/**
 * Returns true if the IP is over the limit (i.e., should be blocked).
 * Returns false if the request is allowed.
 */
export function rateLimit(
    ip: string,
    action: string,
    { limit, windowMs }: RateLimitOptions
): boolean {
    const key = `${action}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        // New window
        store.set(key, { count: 1, resetAt: now + windowMs });
        return false; // allowed
    }

    entry.count++;
    if (entry.count > limit) return true; // blocked
    return false; // allowed
}

/**
 * Returns seconds remaining in the current window for a given IP+action.
 * Returns 0 if no active window.
 */
export function getRateLimitRetryAfter(ip: string, action: string): number {
    const entry = store.get(`${action}:${ip}`);
    if (!entry) return 0;
    return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

/**
 * Extract real IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '0.0.0.0'
    );
}
