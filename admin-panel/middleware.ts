import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fintech_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Login rotasına giriş
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        if (payload?.role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
      } catch (e) {
        // Hatalı token ise devam et (login'i görebilir)
      }
    }
    return NextResponse.next();
  }

  // Admin rotaları (mevcut sayfalarımız)
  const isAdminRoute = pathname.startsWith('/dashboard') || 
                       pathname.startsWith('/firmalar') ||
                       pathname.startsWith('/finansal-rapor') ||
                       pathname.startsWith('/finansal-durum') ||
                       pathname.startsWith('/yatirim') ||
                       pathname.startsWith('/on-sunum') ||
                       pathname.startsWith('/firmalarimiz') ||
                       pathname.startsWith('/sozlesmeler') ||
                       pathname.startsWith('/premium-talepler') ||
                       pathname.startsWith('/loglar');

  if (isAdminRoute) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      if (payload?.role !== 'admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('fintech_auth_token');
      return response;
    }
  }

  // Kullanıcı rotaları
  if (pathname.startsWith('/user')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // Not: Normalde user rolü kontrol edilir. Adminin user panelini görebilmesini istersek burayı esnetebiliriz.
      // if (payload?.role !== 'user' && payload?.role !== 'admin') ...
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('fintech_auth_token');
      return response;
    }
  }

  // Kök dizin kontrolü
  if (pathname === '/') {
    if (token) {
       try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        if (payload?.role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
       } catch (e) {
          return NextResponse.redirect(new URL('/login', request.url));
       }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
