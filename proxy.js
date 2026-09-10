import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Supabase sozlanganmi? Placeholder qiymatlar (.env.local dagi YOUR_...) demo-rejim degani.
// Lokal stack (http://127.0.0.1:54321) ham haqiqiy hisoblanadi. lib/auth.js supabaseSozlanganmi() bilan bir xil.
function supabaseSozlangan() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.startsWith('http') && !url.includes('YOUR') && key.length > 20 && !key.includes('YOUR');
}

// Rol → bosh sahifa (lib/auth.js rolBoshSahifasi bilan bir xil)
function rolBoshSahifasi(rol) {
  if (rol === 'vazirlik') return '/dashboard';
  if (rol === 'admin') return '/admin';
  return '/profile';
}

// Yo'l ↔ rol matritsasi. lib/auth.js dagi yolRuxsatimi bilan BIR XIL bo'lishi shart —
// proxy 'use client' modulni import qilmagani uchun ikki nusxa; o'zgartirsangiz ikkalasini yangilang.
//   /admin                                   → faqat admin
//   /admin/xodimlar, /admin/klassifikatorlar → admin + vazirlik (vazirlik sidebar'i shu ikkisiga havola beradi)
//   /dashboard/*                             → vazirlik, admin
//   /profile/*                               → istalgan autentifikatsiyalangan rol
function yolRuxsatimi(pathname, rol) {
  const ichida = (asos) => pathname === asos || pathname.startsWith(`${asos}/`);
  if (ichida('/admin')) {
    if (rol === 'admin') return true;
    return rol === 'vazirlik' && (ichida('/admin/xodimlar') || ichida('/admin/klassifikatorlar'));
  }
  if (ichida('/dashboard')) return rol === 'vazirlik' || rol === 'admin';
  return true;
}

// Kabinet yo'llari — KabinetShell mount bo'ladigan segmentlar (app/*/layout.jsx) va ildiz.
// Sessiyasiz faqat shular login'ga yo'naltiriladi; boshqa noma'lum manzil o'tkazib yuboriladi va
// Next 404 (app/not-found.jsx) ko'rsatadi — aks holda anonim foydalanuvchi 404 o'rniga doim login ko'rardi.
function kabinetYolimi(pathname) {
  return (
    pathname === '/' ||
    ['/dashboard', '/profile', '/admin', '/elonlar'].some((asos) => pathname === asos || pathname.startsWith(`${asos}/`))
  );
}

export async function proxy(request) {
  if (!supabaseSozlangan()) {
    // Production'da Supabase'siz jim demo bo'lib qolmasin — deploy har so'rovda ochiq nosoz ko'rinsin.
    // Ko'rgazma deploy uchun NEXT_PUBLIC_DEMO_MODE=1 ataylab yoqiladi (.env.example).
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE !== '1') {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL/ANON_KEY sozlanmagan');
    }
    // Demo-rejim (development): auth va rol tekshiruvi klient tomonda (localStorage, KabinetShell) bajariladi
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

  // Yo'naltirish: Supabase yangilagan (refresh) yoki tozalagan (signOut) cookie'lar
  // redirect javobiga ham ko'chirilishi shart, aks holda brauzerda eski sessiya qoladi
  const yonaltir = (yol) => {
    const javob = NextResponse.redirect(new URL(yol, request.url));
    supabaseResponse.cookies.getAll().forEach((c) => javob.cookies.set(c));
    return javob;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Profil roli — so'rov davomida ko'pi bilan BIR marta, faqat kerak bo'lganda o'qiladi.
  // yoq=true: sessiya bor, lekin profiles qatori yo'q (yetim hisob); so'rov xatosi yetim hisoblanmaydi.
  let profil;
  const profilniOl = async () => {
    if (!profil) {
      const { data, error } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();
      profil = { rol: data?.rol ?? null, yoq: !data && !error };
    }
    return profil;
  };

  // Yetim sessiya: chiqaramiz (cookie'lar tozalanadi) va login'ga xato belgisi bilan qaytaramiz
  const yetimniChiqar = async () => {
    await supabase.auth.signOut();
    return yonaltir('/login?xato=profil');
  };

  // Ochiq sahifa: login
  if (pathname === '/login') {
    if (!user) return supabaseResponse;
    // Sign-out cookie'si qandaydir sabab bilan qo'llanmasa ham aylanib qolmaslik uchun
    if (searchParams.get('xato') === 'profil') return supabaseResponse;
    const p = await profilniOl();
    if (p.yoq) return yetimniChiqar();
    return yonaltir(rolBoshSahifasi(p.rol));
  }

  // Sessiya yo'q → kabinet yo'llari login'ga; boshqa (mavjud bo'lmagan) manzil 404 ga o'tadi
  if (!user) return kabinetYolimi(pathname) ? yonaltir('/login') : supabaseResponse;

  const p = await profilniOl();
  if (p.yoq) return yetimniChiqar();

  // Ildiz → rolga qarab bosh sahifa
  if (pathname === '/') return yonaltir(rolBoshSahifasi(p.rol));

  // Rolga yopiq bo'lim → o'z bosh sahifasiga
  if (!yolRuxsatimi(pathname, p.rol)) return yonaltir(rolBoshSahifasi(p.rol));

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Quyidagilardan tashqari barcha yo'llar:
     * - _next/static, _next/image (statik fayllar, rasm optimizatsiyasi)
     * - favicon.ico, icon*, apple-icon* (app/icon.png metadata marshrutlari — login'da ham ochiq bo'lishi shart)
     * - rasm/shrift kengaytmali public fayllar
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon(?:\\d+)?(?:\\.[a-z]+)?$|apple-icon(?:\\d+)?(?:\\.[a-z]+)?$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
