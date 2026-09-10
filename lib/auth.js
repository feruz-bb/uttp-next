'use client';

import { createClient } from './supabase/client';

// localStorage kalit — KabinetShell.jsx (sinxron boshlang'ich holat) va app/page.jsx ham shu keshni o'qiydi
const KESH_KALIT = 'uttp_current_user';

// Supabase sozlanganmi (placeholder emasmi) — proxy.js dagi tekshiruv bilan bir xil mantiq
export function supabaseSozlanganmi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.startsWith('http') && !url.includes('YOUR') && key.length > 20 && !key.includes('YOUR');
}

// Demo-rejim (localStorage auth, Supabase'siz) ruxsat etilganmi — proxy.js dagi guard bilan bir xil shart:
// development'da doim; production'da faqat NEXT_PUBLIC_DEMO_MODE=1 bo'lsa. Supabase sozlangan bo'lsa demo yo'q.
// Production'da Supabase ham, demo bayrog'i ham bo'lmasa proxy.js har so'rovda xato tashlaydi (deploy ochiq
// nosoz ko'rinadi); klientda esa keshga tushmasdan false qaytariladi — tizim jimgina demo bo'lib qolmasin.
export function demoRejimRuxsat() {
  if (supabaseSozlanganmi()) return false;
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE !== '1') {
    console.error('NEXT_PUBLIC_SUPABASE_URL/ANON_KEY sozlanmagan');
    return false;
  }
  return true;
}

function keshgaYoz(profil) {
  try {
    localStorage.setItem(KESH_KALIT, JSON.stringify(profil));
  } catch {
    // xotira to'lgan / private rejim — kesh ixtiyoriy
  }
}

function keshniTozala() {
  try {
    localStorage.removeItem(KESH_KALIT);
  } catch {
    // e'tiborsiz
  }
}

function keshdanOl() {
  try {
    const saqlangan = localStorage.getItem(KESH_KALIT);
    return saqlangan ? JSON.parse(saqlangan) : null;
  } catch {
    // buzuq JSON — e'tiborsiz
    return null;
  }
}

// Joriy foydalanuvchi profili holati: { profil, xato }.
// Supabase rejimi: faqat haqiqiy sessiya hisobga olinadi — kesh hech qachon uning o'rnini bosmaydi.
//   sessiya yo'q             → kesh tozalanadi, { profil: null, xato: false }
//   sessiya bor, profil yo'q → yetim hisob: sessiya yopiladi (proxy.js bilan bir xil), kesh tozalanadi,
//                              { profil: null, xato: false }
//   so'rov xatosi (DB/RLS/tarmoq) → { profil: null, xato: true } — sessiya YOPILMAYDI va bu «sessiya yo'q»
//                              degani EMAS: proxy.js ham xatoni «rol noma'lum» deb qabul qiladi (login'ga
//                              yubormaydi); klient ham login'ga yo'naltirmasligi kerak, aks holda DB vaqtincha
//                              ishlamay qolganda /profile ↔ /login aylanma hosil bo'ladi (KabinetShell).
// Demo rejimi (demoRejimRuxsat): localStorage'dagi profil, xato: false.
export async function joriyProfilHolati() {
  if (supabaseSozlanganmi()) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        keshniTozala();
        return { profil: null, xato: false };
      }
      const { data: profil, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profil) {
        keshgaYoz(profil);
        return { profil, xato: false };
      }
      // So'rov xatosi (tarmoq/DB) yetim hisob emas — sessiyani ham, keshni ham tegmaymiz
      if (error) return { profil: null, xato: true };
      keshniTozala();
      await supabase.auth.signOut();
      return { profil: null, xato: false };
    } catch {
      // tarmoq xatosi — haqiqiy sessiya uchun keshga tushmaymiz, lekin sessiyani yo'q deb ham hisoblamaymiz
      return { profil: null, xato: true };
    }
  }
  if (!demoRejimRuxsat()) return { profil: null, xato: false };
  return { profil: keshdanOl(), xato: false };
}

// Joriy foydalanuvchi profili (yoki null) — joriyProfilHolati() ning qisqa shakli.
// Sahifalar uchun yetarli; «sessiya yo'q» va «so'rov xatosi»ni farqlash kerak bo'lsa (yo'naltirish
// qarori — KabinetShell) joriyProfilHolati() ishlatiladi.
export async function joriyProfilniOl() {
  return (await joriyProfilHolati()).profil;
}

// Email+parol bilan kirish. Muvaffaqiyatda profilni qaytaradi, aks holda null.
export async function tizimgaKirish(email, parol) {
  if (!supabaseSozlanganmi()) return null;
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parol });
  if (error || !data?.user) return null;
  const { data: profil } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();
  if (!profil) {
    // auth.users'da bor, profiles'da yo'q — yetim hisob: kabinetga qo'ymaymiz (proxy.js baribir chiqarib yuborardi)
    try {
      await supabase.auth.signOut();
    } catch {
      // sessiya yopilmasa ham kirish rad etiladi
    }
    keshniTozala();
    return null;
  }
  keshgaYoz(profil);
  return profil;
}

// Chiqish: Supabase sessiyasi ham, localStorage ham tozalanadi
export async function tizimdanChiqish() {
  if (supabaseSozlanganmi()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // sessiya bo'lmasa ham davom etamiz
    }
  }
  keshniTozala();
}

// Rolga qarab bosh sahifa manzili
export function rolBoshSahifasi(rol) {
  if (rol === 'vazirlik') return '/dashboard';
  if (rol === 'admin') return '/admin';
  return '/profile';
}

// Yo'l ↔ rol matritsasi. proxy.js dagi yolRuxsatimi bilan BIR XIL bo'lishi shart —
// proxy 'use client' modulni import qilmagani uchun ikki nusxa; o'zgartirsangiz ikkalasini yangilang.
//   /admin                                   → faqat admin
//   /admin/xodimlar, /admin/klassifikatorlar → admin + vazirlik (vazirlik sidebar'i shu ikkisiga havola beradi)
//   /dashboard/*                             → vazirlik, admin
//   /profile/*                               → istalgan autentifikatsiyalangan rol
export function yolRuxsatimi(pathname, rol) {
  const ichida = (asos) => pathname === asos || pathname.startsWith(`${asos}/`);
  if (ichida('/admin')) {
    if (rol === 'admin') return true;
    return rol === 'vazirlik' && (ichida('/admin/xodimlar') || ichida('/admin/klassifikatorlar'));
  }
  if (ichida('/dashboard')) return rol === 'vazirlik' || rol === 'admin';
  return true;
}
