'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './icons.jsx';
import { Badge } from './ui.jsx';

// Rolga qarab menyu — eski uttp-platform nav.js uslubida (icon nomlari icons.jsx dan).
// 2026-09 UI polish: bandlar 11px «eyebrow» sarlavhali guruhlarga bo'lindi;
// href/icon/faol-yo'l mantiqi o'zgarmagan.
const NAV = {
  vazirlik: [
    {
      label: 'Monitoring',
      items: [
        { href: '/dashboard', label: 'Tahlil paneli', icon: 'chart' },
        { href: '/dashboard/talim', label: 'Ta‘lim zanjiri', icon: 'book' },
        { href: '/elonlar', label: 'Ilm-fan va innovatsiyalar', icon: 'flask' },
      ],
    },
    {
      label: 'Reestr',
      items: [{ href: '/admin/xodimlar', label: 'Xodimlar reyestri', icon: 'users' }],
    },
    {
      label: 'Boshqaruv',
      items: [{ href: '/admin/klassifikatorlar', label: 'Klassifikatorlar', icon: 'registry' }],
    },
  ],
  admin: [
    {
      label: 'Boshqaruv',
      items: [
        { href: '/admin', label: 'Boshqaruv paneli', icon: 'chart' },
        { href: '/elonlar', label: 'Ilm-fan va innovatsiyalar', icon: 'flask' },
      ],
    },
    {
      label: 'Reestr',
      items: [{ href: '/admin/xodimlar', label: 'Xodimlar reyestri', icon: 'users' }],
    },
    {
      label: 'Tizim',
      items: [
        { href: '/admin/klassifikatorlar', label: 'Klassifikatorlar', icon: 'registry' },
        { href: '/admin/sozlamalar', label: 'Sozlamalar', icon: 'key' },
      ],
    },
  ],
  xodim: [
    {
      label: 'Kabinet',
      items: [{ href: '/profile', label: 'Shaxsiy profil', icon: 'home' }],
    },
    {
      label: 'Ta‘lim',
      items: [{ href: '/profile/talim', label: 'Ta‘lim tarixi', icon: 'book' }],
    },
    {
      label: 'Malaka',
      items: [
        { href: '/profile/litsenziya', label: 'Malaka toifasi', icon: 'shield' },
        { href: '/profile/kredit', label: 'UKTT kreditlari', icon: 'credit' },
      ],
    },
    {
      label: 'Hujjatlar',
      items: [{ href: '/profile/hujjatlar', label: 'Hujjatlarim', icon: 'folder' }],
    },
  ],
  // Oliy ta'lim talabasi (TDTU ro'yxati): faqat profil va ta'lim yo'li
  talaba: [
    {
      label: 'Kabinet',
      items: [
        { href: '/profile', label: 'Talaba profili', icon: 'home' },
        { href: '/elonlar', label: 'Ilm-fan va innovatsiyalar', icon: 'flask' },
        { href: '/profile/talim', label: 'Ta‘lim yo‘lim', icon: 'book' },
      ],
    },
  ],
  // Doktorant (rol='talaba', hozirgi_bosqich='doktorantura'): talaba bilan bir xil bandlar, nomi boshqa
  doktorant: [
    {
      label: 'Kabinet',
      items: [
        { href: '/profile', label: 'Doktorant profili', icon: 'home' },
        { href: '/elonlar', label: 'Ilm-fan va innovatsiyalar', icon: 'flask' },
        { href: '/profile/talim', label: 'Ta‘lim yo‘lim', icon: 'book' },
      ],
    },
  ],
  // Maktab o'quvchisi (chuqurlashtirilgan sinf): litsenziya/kredit unga taalluqli emas
  oquvchi: [
    {
      label: 'Kabinet',
      items: [
        { href: '/profile', label: 'Shaxsiy profil', icon: 'home' },
        { href: '/elonlar', label: 'Ilm-fan va innovatsiyalar', icon: 'flask' },
        { href: '/profile/talim', label: 'Ta‘lim yo‘lim', icon: 'book' },
        { href: '/profile/yonalish', label: 'Tibbiyotga yo‘l', icon: 'flag' },
      ],
    },
  ],
};

export default function Sidebar({ user, onLogout, open = true, onToggle }) {
  const pathname = usePathname();
  const rol = user?.rol || 'xodim';
  const oquvchimi = rol === 'xodim' && user?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf';
  const doktorantmi = rol === 'talaba' && user?.hozirgi_bosqich === 'doktorantura';
  const groups = oquvchimi ? NAV.oquvchi : doktorantmi ? NAV.doktorant : NAV[rol] || NAV.xodim;

  const displayName = user?.fish || user?.email || 'Foydalanuvchi';
  // Bir so'zli nom (masalan, vazirlik hisobi «SSV») — so'zning o'zi 3 belgigacha; aks holda bosh harflar
  const sozlar = displayName.trim().split(/\s+/);
  const initials = (sozlar.length === 1 ? sozlar[0].slice(0, 3) : sozlar.map((x) => x[0]).join('').slice(0, 2)).toUpperCase();
  const rolNomi = oquvchimi
    ? 'O‘quvchi kabineti'
    : doktorantmi
      ? 'Doktorant kabineti'
      : rol === 'vazirlik' ? 'Vazirlik paneli' : rol === 'admin' ? 'Super admin' : rol === 'talaba' ? 'Talaba kabineti' : 'Shifokor kabineti';

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

        <nav className="sidebar__nav" aria-label="Asosiy menyu">
          {groups.map((group, gi) => {
            const labelId = `sb-group-${gi}`;
            return (
              <div key={group.label} className="nav-group" role="group" aria-labelledby={labelId}>
                {/* Eyebrow — yig'ilgan holatda matn so'nadi, o'rnida qisqa hairline qoladi */}
                <div id={labelId} className="nav-group__label">
                  <span className="nav-group__label-text">{group.label}</span>
                </div>
                {group.items.map((item) => {
                  const IconCmp = Icon[item.icon] || Icon.folder;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <IconCmp />
                      <span className="nav-item__label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Foydalanuvchi — oyna pastki qismida: avatar, ism, rol chipi, chiqish */}
        <div className="sidebar__user" title={displayName}>
          <div className="avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-rol sidebar__user-name">{displayName}</div>
            <div className="sidebar__user-chip">
              <Badge tone="neutral" variant="dot">{rolNomi}</Badge>
            </div>
            <button className="user-menu__logout" onClick={onLogout}>Chiqish</button>
          </div>
        </div>

        <div className="sidebar__foot">
          <div className="sidebar__help">
            <Icon.phone aria-hidden="true" />
            <span>Yordam markazi · 1003</span>
          </div>
          <div className="sidebar__copy">© 2026 Elektron tibbiy ta’lim platformasi</div>
        </div>
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
