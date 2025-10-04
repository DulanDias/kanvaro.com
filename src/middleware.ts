import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and public routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/setup' ||
    pathname.startsWith('/setup/') ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/verify-otp' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/docs') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // For protected routes, let the client-side handle authentication
  // The client will check auth status and redirect appropriately
  return NextResponse.next()
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
}
