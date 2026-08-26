'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './icons.jsx';

// Rolga qarab menyu — eski uttp-platform nav.js uslubida (icon nomlari icons.jsx dan)
const NAV = {
  vazirlik: [
    { href: '/dashboard', label: 'Tahlil paneli', icon: 'chart' },
    { href: '/admin/xodimlar', label: 'Xodimlar reyestri', icon: 'users' },
    { href: '/admin/klassifikatorlar', label: 'Klassifikatorlar', icon: 'registry' },
  ],
  admin: [
    { href: '/admin', label: 'Boshqaruv paneli', icon: 'chart' },
    { href: '/admin/xodimlar', label: 'Xodimlar (CRUD)', icon: 'users' },
    { href: '/admin/klassifikatorlar', label: 'Yo‘nalish va hududlar', icon: 'registry' },
  ],
  xodim: [
    { href: '/profile', label: 'Shaxsiy profil', icon: 'home' },
    { href: '/profile/talim', label: 'Ta‘lim tarixi', icon: 'book' },
    { href: '/profile/litsenziya', label: 'TFX litsenziyasi', icon: 'shield' },
    { href: '/profile/kredit', label: 'UKTT kreditlari', icon: 'credit' },
    { href: '/profile/hujjatlar', label: 'Hujjatlarim', icon: 'folder' },
  ],
};

export default function Sidebar({ user, onLogout, open = true, onToggle }) {
  const pathname = usePathname();
  const rol = user?.rol || 'xodim';
  const items = NAV[rol] || NAV.xodim;

  const displayName = user?.fish || user?.email || 'Foydalanuvchi';
  const initials = displayName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  const rolNomi = rol === 'vazirlik' ? 'Vazirlik paneli' : rol === 'admin' ? 'Super admin' : 'Shifokor kabineti';

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <button
            className="sidebar__logo"
            onClick={onToggle}
            title={open ? 'Menyuni yig‘ish' : 'Menyuni ochish'}
          >
            ⚕
          </button>
          <div className="sidebar__title">
            ELEKTRON TIBBIY
            <br />
            <span>TA’LIM PLATFORMASI</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {items.map((item) => {
            const IconCmp = Icon[item.icon] || Icon.folder;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <IconCmp />
                <span className="nav-item__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Foydalanuvchi — oyna pastki qismida */}
        <div className="sidebar__user" title={displayName}>
          <div className="avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-rol">{displayName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {rolNomi}
            </div>
            <button className="user-menu__logout" onClick={onLogout}>Chiqish</button>
          </div>
        </div>

        <div className="sidebar__foot">© 2026 Elektron tibbiy ta’lim platformasi</div>
      </aside>

      {/* Sidebar chegarasi ustidagi yig'ish/ochish tugmasi */}
      <button
        className="sidebar__collapse"
        onClick={onToggle}
        title={open ? 'Menyuni yig‘ish' : 'Menyuni ochish'}
        aria-label={open ? 'Menyuni yig‘ish' : 'Menyuni ochish'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </>
  );
}
