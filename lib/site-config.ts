export function getBaseUrl() {
    let url = '';

    // If we have a manually configured app URL, use it (highest priority)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        url = process.env.NEXT_PUBLIC_APP_URL;
    }
    // If we're on Vercel, use the VERCEL_URL environment variable
    else if (process.env.VERCEL_URL) {
        url = `https://${process.env.VERCEL_URL}`;
    }
    // Fallback for local development or if other variables aren't set
    // This will be used if window is available (client-side)
    else if (typeof window !== 'undefined') {
        url = window.location.origin;
    }
    // Final fallback (typically for SSR/API routes if no env vars are present)
    else {
        url = 'http://localhost:3000';
    }

    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url;
}
