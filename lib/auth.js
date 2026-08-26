'use client';

import { createClient } from './supabase/client';
import { INITIAL_PROFILES } from './data-service';

// Supabase sozlanganmi (placeholder emasmi) — proxy.js dagi tekshiruv bilan bir xil mantiq
export function supabaseSozlanganmi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.startsWith('http') && !url.includes('YOUR') && key.length > 20 && !key.includes('YOUR');
}

// Joriy foydalanuvchi profili: avval Supabase sessiyasi, bo'lmasa localStorage (demo)
export async function joriyProfilniOl() {
  if (supabaseSozlanganmi()) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profil } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profil) {
          localStorage.setItem('uttp_current_user', JSON.stringify(profil));
          return profil;
        }
      }
    } catch {
      // pastdagi localStorage fallback'ga o'tamiz
    }
  }
  try {
    const saqlangan = localStorage.getItem('uttp_current_user');
    if (saqlangan) return JSON.parse(saqlangan);
  } catch {
    // buzuq JSON — e'tiborsiz
  }
  return null;
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
    .single();
  const natija = profil || { id: data.user.id, email, rol: 'xodim' };
  localStorage.setItem('uttp_current_user', JSON.stringify(natija));
  return natija;
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
  localStorage.removeItem('uttp_current_user');
}

// Rolga qarab bosh sahifa manzili
export function rolBoshSahifasi(rol) {
  if (rol === 'vazirlik') return '/dashboard';
  if (rol === 'admin') return '/admin';
  return '/profile';
}
