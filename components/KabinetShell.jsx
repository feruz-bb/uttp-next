'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import StoryLenta from './story/StoryLenta';
import { INITIAL_PROFILES } from '../lib/data-service';
import {
  joriyProfilHolati,
  tizimdanChiqish,
  supabaseSozlanganmi,
  yolRuxsatimi,
  rolBoshSahifasi,
} from '../lib/auth';

// SSR'da useLayoutEffect ogohlantirish bermasligi uchun izomorf variant
const useBrauzerLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SB_KEY = 'uttp_sidebar';
// Sahifa masshtabi — eski platformadagidek belgilangan 80%.
// app/layout.jsx dagi inline skript hydration'dan OLDIN aynan shu qiymatlarni qo'yadi ('80%' / '0.8');
// o'zgartirsangiz u yerni ham yangilang.
const ZOOM = 80;
const ZOOM_QIYMAT = `${ZOOM}%`;
const ZOOM_TOKEN = String(ZOOM / 100);
// joriyProfilHolati() so'rov xatosi belgisi (null «sessiya yo'q» bilan aralashmasin)
const XATO = Symbol('profil-xato');

// Uchala rol kabineti uchun umumiy qobiq — uttp-platform Layout/ShifokorLayout
// tuzilmasi: .app.app--gov > .sidebar + .main > .content > .glass-page.
// defaultProfilIndex — demo-rejimda sessiya bo'lmaganda ko'rsatiladigan profil.
export default function KabinetShell({ defaultProfilIndex = 0, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sbOpen, setSbOpen] = useState(true);
  // joriyProfilHolati() natijasi: undefined — hali kutilmoqda; null — sessiya/profil yo'q;
  // XATO — so'rov xatosi (sessiya bor-yo'qligi noma'lum); obyekt — tasdiqlangan profil
  const [tasdiq, setTasdiq] = useState(undefined);

  // Sinxron boshlang'ich holat — paint'dan OLDIN qo'llanadi. Segmentlar orasida
  // o'tishda (masalan /dashboard → /admin/xodimlar) shell qayta mount bo'ladi;
  // keshlangan profilsiz sidebar bir lahza fallback "xodim" menyusini chizib
  // yuborardi (glitch). Kesh auth.js'dagi uttp_current_user bilan bir xil.
  useBrauzerLayoutEffect(() => {
    setSbOpen(localStorage.getItem(SB_KEY) !== 'closed');
    try {
      const saqlangan = localStorage.getItem('uttp_current_user');
      if (saqlangan) setUser(JSON.parse(saqlangan));
    } catch {
      // buzuq JSON — asinxron yo'l hal qiladi
    }
  }, []);

  useEffect(() => {
    let bekor = false;
    joriyProfilHolati()
      .then((holat) => {
        if (!bekor) setTasdiq(holat.xato ? XATO : holat.profil ?? null);
      })
      .catch(() => {
        // kutilmagan istisno — sessiya holati noma'lum, xato kabi qabul qilinadi
        if (!bekor) setTasdiq(XATO);
      });
    return () => {
      bekor = true;
    };
  }, [defaultProfilIndex]);

  // Rol → yo'l himoyasi (proxy.js ning klient tomondagi aksi, matritsa lib/auth.js yolRuxsatimi):
  // demo-rejimda yagona qo'riqchi; Supabase rejimida sahifa ochiq turganda sessiya tugasa ishga tushadi.
  useEffect(() => {
    if (tasdiq === undefined) return;
    if (tasdiq === XATO) {
      // DB/RLS/tarmoq xatosi: sessiya yo'q degani emas — login'ga yubormaymiz (proxy.js ham xatoda
      // login'ga yubormaydi, aks holda /profile ↔ /login aylanma). Keshlangan foydalanuvchi qoladi,
      // sahifa o'z zaxira/«topilmadi» holatini ko'rsatadi; keyingi navigatsiyada qayta tekshiriladi.
      return;
    }
    if (!tasdiq) {
      if (supabaseSozlanganmi()) {
        router.replace('/login');
        return;
      }
      // Demo: sessiyasiz ko'rgazma profili (segmentning o'z roli — matritsaga doim mos)
      setUser(INITIAL_PROFILES[defaultProfilIndex]);
      return;
    }
    if (!yolRuxsatimi(pathname, tasdiq.rol)) {
      router.replace(rolBoshSahifasi(tasdiq.rol));
      return;
    }
    setUser(tasdiq);
  }, [tasdiq, pathname, defaultProfilIndex, router]);

  // Zoom — to'liq yuklanishda app/layout.jsx dagi inline skript hydration'dan oldin qo'yib bo'lgan;
  // bu effekt klient navigatsiyasi (/login → kabinet) uchun zaxira. Idempotent: bir xil qiymatni
  // qayta yozmaydi, shuning uchun skript bilan «tortishmaydi». Chiqishda tiklanadi (login to'liq o'lchamda).
  useBrauzerLayoutEffect(() => {
    const uslub = document.documentElement.style;
    if (uslub.zoom !== ZOOM_QIYMAT) uslub.zoom = ZOOM_QIYMAT;
    if (uslub.getPropertyValue('--zoom') !== ZOOM_TOKEN) uslub.setProperty('--zoom', ZOOM_TOKEN);
    return () => {
      uslub.zoom = '';
      uslub.removeProperty('--zoom');
    };
  }, []);

  const toggleSidebar = () =>
    setSbOpen((o) => {
      localStorage.setItem(SB_KEY, o ? 'closed' : 'open');
      return !o;
    });

  const handleLogout = async () => {
    await tizimdanChiqish();
    router.push('/login');
  };

  return (
    <div className={`app app--gov ${sbOpen ? '' : 'app--sb-closed'}`}>
      <Sidebar user={user} onLogout={handleLogout} open={sbOpen} onToggle={toggleSidebar} />
      <div className="main" style={{ position: 'relative' }}>
        <div className="content">
          <div className="glass-page">
            {/* Ilm-fan va innovatsiyalar story lentasi — faqat rol bosh sahifalarida (Instagram uslubi) */}
            {['/dashboard', '/admin', '/profile'].includes(pathname) && user && <StoryLenta user={user} />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
