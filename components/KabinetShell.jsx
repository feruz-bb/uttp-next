'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { INITIAL_PROFILES } from '../lib/data-service';
import { joriyProfilniOl, tizimdanChiqish } from '../lib/auth';

const SB_KEY = 'uttp_sidebar';
// Sahifa masshtabi — eski platformadagidek belgilangan 80%
const ZOOM = 80;

// Uchala rol kabineti uchun umumiy qobiq — uttp-platform Layout/ShifokorLayout
// tuzilmasi: .app.app--gov > .sidebar + .main > .content > .glass-page.
// defaultProfilIndex — demo-rejimda sessiya bo'lmaganda ko'rsatiladigan profil.
export default function KabinetShell({ defaultProfilIndex = 0, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sbOpen, setSbOpen] = useState(true);

  useEffect(() => {
    setSbOpen(localStorage.getItem(SB_KEY) !== 'closed');
    let bekor = false;
    joriyProfilniOl().then((profil) => {
      if (!bekor) setUser(profil || INITIAL_PROFILES[defaultProfilIndex]);
    });
    return () => {
      bekor = true;
    };
  }, [defaultProfilIndex]);

  // Zoom — kabinet ochiq bo'lganda qo'llanadi, chiqishda tiklanadi (login to'liq o'lchamda)
  useEffect(() => {
    document.documentElement.style.zoom = `${ZOOM}%`;
    document.documentElement.style.setProperty('--zoom', String(ZOOM / 100));
    return () => {
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--zoom');
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
          <div className="glass-page">{children}</div>
        </div>
      </div>
    </div>
  );
}
