import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/courses',
    '/labs',
    '/resources',
    '/profile',
    '/leaderboard',
    '/admin',
];

// Routes that should NOT be accessible if logged in
const authRoutes = ['/login', '/signup', '/signin'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for sessionId cookie - this is the source of truth for auth in middleware
    const sessionId = request.cookies.get('sessionId')?.value;

    // Handle /dashboard specially since it's now part of the virtual homepage
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 1. Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = pathname.startsWith('/admin') && !pathname.includes('/admin/login');

    if (isProtectedRoute) {
        if (!sessionId) {
            // No session cookie? Redirect to login
            const loginPath = isAdminRoute ? '/admin/login' : '/login';
            const url = new URL(loginPath, request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
    }

    // 2. Prevent logged in users from visiting login/signup
    if (authRoutes.includes(pathname) && sessionId) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
