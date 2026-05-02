import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('sb-access-token')?.value;
  const role = request.cookies.get('sb-role')?.value;

  // Protect (admin) and (user) routes
  // Assume everything that is not /user or /auth is admin route, but better to be explicit
  const isAdminRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/firmalar') || pathname.startsWith('/sozlesmeler') || pathname.startsWith('/premium-talepler') || pathname.startsWith('/loglar') || pathname.startsWith('/ayarlar') || pathname.startsWith('/yatirim');
  const isUserRoute = pathname.startsWith('/user');
  
  if (!token) {
    if (isAdminRoute || isUserRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If logged in, don't allow access to login/register or root
    if (pathname === '/login' || pathname === '/register' || pathname === '/') {
      return NextResponse.redirect(new URL(role === 'admin' ? '/dashboard' : '/user/dashboard', request.url));
    }
    // Prevent user from accessing admin
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    // Prevent admin from accessing user
    if (isUserRoute && role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
