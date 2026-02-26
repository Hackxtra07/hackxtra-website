export function getBaseUrl() {
    // If we have a manually configured app URL, use it (highest priority)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // If we're on Vercel, use the VERCEL_URL environment variable
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for local development or if other variables aren't set
    // This will be used if window is available (client-side)
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Final fallback (typically for SSR/API routes if no env vars are present)
    return 'http://localhost:3000';
}
