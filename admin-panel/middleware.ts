import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fintech_auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Kök route -> dashboard
  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Login iken login'e gidiliyorsa -> dashboard
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Sadece admin sayfalarını koru (static dosyaları veya login'i değil)
  const isProtectedRoute = !path.startsWith('/login') && !path.startsWith('/_next') && !path.startsWith('/favicon');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token var ve route korumalı ise -> basit jwt çözümlemesi (Edge Runtime)
  if (isProtectedRoute && token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // İleride rol bazlı yetkilendirme eklenebilir
      // if (payload.role !== 'admin') { ... }
    } catch (error) {
      // Hatalı token -> temizle ve logine dön
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('fintech_auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
