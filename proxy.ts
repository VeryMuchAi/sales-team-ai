import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isEmailWhitelisted } from '@/lib/auth/whitelist';

/**
 * Host-based routing para hub.verymuch.ai:
 * Reescribe internamente hub.verymuch.ai/* → /hub/* sin cambiar la URL visible.
 * Así hub.verymuch.ai/ muestra la landing y hub.verymuch.ai/apply el formulario,
 * sin el doble /hub en la barra de direcciones.
 */
const HUB_HOST = 'hub.verymuch.ai';

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Host-based routing: hub.verymuch.ai
  if (host === HUB_HOST) {
    const pathname = request.nextUrl.pathname;

    // Si alguien llega directamente a hub.verymuch.ai/hub → redirigir a / (URL limpia)
    if (pathname === '/hub' || pathname === '/hub/') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Rewrite interno: hub.verymuch.ai/* → /hub/* (URL visible no cambia)
    if (!pathname.startsWith('/hub')) {
      const url = request.nextUrl.clone();
      url.pathname = '/hub' + (pathname === '/' ? '' : pathname);
      return NextResponse.rewrite(url);
    }
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
  matcher: [
    // Cubre todos los paths excepto assets estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
