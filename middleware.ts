import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/utils-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Identificamos si la ruta requiere autenticación de Admin
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isLoginPage = pathname === '/admin/login';

  // Leemos la cookie de sesión
  const token = request.cookies.get('admin_token')?.value;
  const session = token ? await verifySession(token) : null;

  // Si intenta acceder a /admin/... sin estar logueado -> Redirigir a /admin/login
  if (isAdminRoute && !session) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está logueado e intenta entrar a /admin/login -> Redirigir al panel principal
  if (isLoginPage && session) {
    const adminHomeUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminHomeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};