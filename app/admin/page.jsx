'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHead, StatCard } from '../../components/ui.jsx';
import Icon from '../../components/icons.jsx';
import { getProfiles, getYonalishlar } from '../../lib/data-service';

export default function AdminOverviewPage() {
  const [profiles, setProfiles] = useState([]);
  const [yonalishlar, setYonalishlar] = useState([]);

  useEffect(() => {
    getProfiles().then(setProfiles);
    getYonalishlar().then(setYonalishlar);
  }, []);

  const soni = (bosqich) => yonalishlar.filter((y) => y.bosqich === bosqich).length;

  const HAVOLALAR = [
    {
      href: '/admin/xodimlar',
      icon: 'users',
      t: 'Xodimlar boshqaruvi (CRUD)',
      d: 'Yangi xodim qo‘shish, tahrirlash va o‘chirish',
    },
    {
      href: '/admin/klassifikatorlar',
      icon: 'registry',
      t: 'Yo‘nalishlar va hududlar',
      d: 'Klassifikatorlarni ko‘rish va ma‘lumotlar bazasi',
    },
  ];

  return (
    <>
      <PageHead
        title="Tizim holati va boshqaruv"
        subtitle="Yagona reyestr ma'lumotlari, yangi xodimlarni ro'yxatga olish va klassifikatorlar sozlamalari"
      />

      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Jami xodimlar" value={profiles.length} icon="users" tone="primary" />
        <StatCard label="Bakalavriat yo'nalishlari" value={soni('bakalavriat') || 9} icon="book" tone="teal" />
        <StatCard label="Magistratura mutaxassisliklari" value={soni('magistratura') || 26} icon="flask" tone="violet" />
        <StatCard label="Doktarantura ixtisosliklari" value={soni('doktarantura') || 18} icon="shield" tone="success" />
      </div>

      {/* Tezkor havolalar */}
      <div className="grid cols-2" style={{ gap: 20 }}>
        {HAVOLALAR.map((h) => {
          const IconCmp = Icon[h.icon] || Icon.folder;
          return (
            <Link key={h.href} href={h.href} className="card row-click" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="stat__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
                <IconCmp width={20} height={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{h.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{h.d}</div>
              </div>
              <span style={{ color: 'var(--muted)' }}>→</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
