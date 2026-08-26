import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Supabase sozlanganmi? Placeholder qiymatlar (.env.local dagi YOUR_...) demo-rejim degani.
// Lokal stack (http://127.0.0.1:54321) ham haqiqiy hisoblanadi.
function supabaseSozlangan() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.startsWith('http') && !url.includes('YOUR') && key.length > 20 && !key.includes('YOUR');
}

export async function proxy(request) {
  // Demo-rejim: auth tekshiruvi klient tomonda (localStorage) bajariladi
  if (!supabaseSozlangan()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login') {
    if (user) {
      // Logged in user on login page → redirect to their role's home
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      const rol = profile?.rol || 'xodim';
      const dest = rol === 'vazirlik' ? '/dashboard' : rol === 'admin' ? '/admin' : '/profile';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return supabaseResponse;
  }

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Root path → redirect based on role
  if (pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    const rol = profile?.rol || 'xodim';
    const dest = rol === 'vazirlik' ? '/dashboard' : rol === 'admin' ? '/admin' : '/profile';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
