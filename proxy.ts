import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isEmailWhitelisted } from '@/lib/auth/whitelist';

/**
 * Host-based routing: cuando el visitante llega por `hub.verymuch.ai` a la
 * raíz, redirigimos a `/hub` (la landing del talento) para que sea lo
 * primero que ven. En el dominio principal, `/` sigue mostrando Sales
 * Intelligence.
 */
const HUB_HOST = 'hub.verymuch.ai';

export async function proxy(request: NextRequest) {
  // Redirect: hub.verymuch.ai/ → hub.verymuch.ai/hub
  const host = request.headers.get('host') ?? '';
  if (host === HUB_HOST && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/hub';
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Registro público deshabilitado: /signup → /login
  if (request.nextUrl.pathname === '/signup') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Whitelist: solo emails autorizados (tabla whitelisted_emails + RPC is_email_whitelisted)
  if (user?.email && request.nextUrl.pathname.startsWith('/dashboard')) {
    const allowed = await isEmailWhitelisted(supabase, user.email);
    if (!allowed) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'restricted');
      return NextResponse.redirect(url);
    }
  }

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // `/` para el redirect host-based hub.verymuch.ai → /hub
  // El resto son los matchers originales de auth (dashboard, login, signup)
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
};
