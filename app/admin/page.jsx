'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHead, StatCard, Card, DataTable, SectionHead, KpiStrip } from '../../components/ui.jsx';
import Icon from '../../components/icons.jsx';
import { getProfiles, getYonalishlar, getJadvalHajmlari } from '../../lib/data-service';
import { fmt, GrafikSarlavha, ManbaIzoh } from '../../lib/chart-utils';

// Rol qatorlari — qat'iy tartib (Talaba → Xodim → Vazirlik → Admin)
const ROL_TARTIBI = [
  { rol: 'talaba', nomi: 'Talaba' },
  { rol: 'xodim', nomi: 'Xodim' },
  { rol: 'vazirlik', nomi: 'Vazirlik' },
  { rol: 'admin', nomi: 'Admin' },
];

export default function AdminOverviewPage() {
  const [profiles, setProfiles] = useState([]);
  const [yonalishlar, setYonalishlar] = useState([]);
  const [yonalishYuklandi, setYonalishYuklandi] = useState(false);
  const [hajmlar, setHajmlar] = useState([]);

  useEffect(() => {
    getProfiles().then(setProfiles);
    getYonalishlar().then((data) => {
      setYonalishlar(data);
      setYonalishYuklandi(true);
    });
    getJadvalHajmlari().then(setHajmlar);
  }, []);

  // Klassifikator zaxira qiymatlari — 2026-09-07 seed holati, jami 98 (Supabase ulanmasa); yuklangunga qadar «…»
  const YONALISH_ZAXIRA = { texnikum: 10, bakalavriat: 9, magistratura: 42, doktorantura: 37 };
  const soni = (bosqich) => {
    if (!yonalishYuklandi) return '…';
    const n = yonalishlar.filter((y) => y.bosqich === bosqich).length;
    return n || YONALISH_ZAXIRA[bosqich] || 0;
  };

  // Jadvallar — qatorlar soni bo'yicha kamayish tartibida
  const jadvalQatorlar = useMemo(
    () => [...hajmlar].sort((a, b) => (b.qatorlar ?? 0) - (a.qatorlar ?? 0)),
    [hajmlar]
  );

  // Rol kesimi — profiles jadvalining 4 rol qatori, qat'iy tartibda
  // (bosqich bo'yicha ajratilgan «talaba · doktorantura» qatori rol jamining bir qismi — bu yerga kirmaydi)
  const rolData = useMemo(
    () =>
      ROL_TARTIBI.map((r) => {
        const q = hajmlar.find((h) => h.jadval === 'profiles' && h.rol === r.rol && !h.bosqich);
        return { ...r, soni: q ? (q.qatorlar ?? 0) : 0 };
      }),
    [hajmlar]
  );

  // Hisob holati: hali yuklanmagan / jonli / zaxira (kamida bitta jonli hisob olinganmi)
  const yuklanmoqda = hajmlar.length === 0;
  const jonli = hajmlar.some((h) => h.jonli);
  const hisobHolati = yuklanmoqda
    ? 'yuklanmoqda…'
    : jonli
      ? 'jonli hisob · Supabase'
      : 'zaxira qiymatlar · 2026-09-07 holati';

  const HAVOLALAR = [
    {
      href: '/admin/xodimlar',
      icon: 'users',
      t: 'Xodimlar boshqaruvi',
      d: 'Yangi xodim qo‘shish, tahrirlash va o‘chirish',
    },
    {
      href: '/admin/klassifikatorlar',
      icon: 'registry',
      t: 'Klassifikatorlar',
      d: 'Mutaxassislik va yo‘nalish kodlari reyestri',
    },
  ];

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Boshqaruv paneli' }]}
        title="Tizim holati va boshqaruv"
        subtitle="Yagona reyestr ma’lumotlari, yangi xodimlarni ro‘yxatga olish va klassifikatorlar sozlamalari"
        meta={`Ma’lumot holati: ${hisobHolati}`}
      />

      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        {/* getProfiles talaba rolini chiqarib tashlaydi — xodim + vazirlik + admin (7 + 1 + 1) */}
        <StatCard label="Xodim, vazirlik va admin hisoblari" value={profiles.length} icon="users" tone="primary" />
        <StatCard label="Bakalavriat yo‘nalishlari" value={soni('bakalavriat')} icon="book" tone="teal" />
        <StatCard label="Magistratura mutaxassisliklari" value={soni('magistratura')} icon="flask" tone="violet" />
        <StatCard label="Doktorantura ixtisosliklari" value={soni('doktorantura')} icon="shield" tone="success" />
      </div>

      {/* Ma'lumotlar bazasi holati: rol kesimi (ixcham qator) + jadvallar hajmi (to'liq kenglikda) */}
      {/* Ma'lumot holati PageHead meta satrida — bu yerda takrorlanmaydi */}
      <SectionHead title="Ma‘lumotlar bazasi" />
      <div className="grid" style={{ gap: 24, marginBottom: 24 }}>
        <Card title="Foydalanuvchilar — rol bo‘yicha">
          <GrafikSarlavha izoh="profiles jadvali, rol kesimi">Qaysi rolda nechta hisob ochilgan?</GrafikSarlavha>
          {/* 28 122 : 7 : 1 : 1 nisbati bitta o'qda o'qilmaydi — shuning uchun grafik emas, KPI chizig'i (Q3) */}
          <KpiStrip
            items={rolData.map((r) => ({ key: r.rol, label: r.nomi, value: yuklanmoqda ? '…' : fmt(r.soni) }))}
          />
          <ManbaIzoh>
            Har bir hisobga profil biriktirilgan (auth.users ↔ profiles). Talaba rolidagi 28 122 hisob = 27 739
            talaba + 383 doktorant — talaba va doktorant jadvallari bilan 1:1.
          </ManbaIzoh>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
            Talaba va doktorant hisoblari 2026-09-06 kuni TDTU ro‘yxatlari asosida avtomatik ochib berilgan; qolgan
            rollar — demo hisoblar.
          </div>
        </Card>

        <Card title="Jadvallar hajmi">
          <DataTable
            numbered
            rowKey={(r) => [r.jadval, r.rol, r.bosqich].filter(Boolean).join(':')}
            columns={[
              {
                key: 'nomi',
                label: 'Jadval',
                // Qator sarlavhasi (th scope="row", 600 vazn); pastki texnik satr oddiy vaznda
                rowHeader: true,
                render: (r) => (
                  <div>
                    <div>{r.nomi}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--muted)', marginTop: 1 }}>
                      {r.jadval}{r.rol ? ` · rol = ${r.rol}` : ''}{r.bosqich ? ` · hozirgi_bosqich = ${r.bosqich}` : ''}
                    </div>
                  </div>
                ),
              },
              {
                key: 'qatorlar',
                label: 'Qatorlar',
                numeric: true,
                render: (r) => fmt(r.qatorlar),
              },
              {
                key: 'manba',
                label: 'Manba',
                render: (r) => <span style={{ color: 'var(--muted)' }}>{r.manba}</span>,
              },
            ]}
            rows={jadvalQatorlar}
            empty="Hisob yuklanmoqda…"
          />
          <ManbaIzoh>
            Qatorlar soni sahifa ochilganda Supabase’dan jonli hisoblanadi (faqat admin huquqi bilan); ulanish
            bo‘lmasa 2026-09-07 holatidagi ma’lum qiymatlar ko‘rsatiladi. Grant loyihalari (TDTU 8, Biofarm 7) —
            rejada, hali yuklanmagan.
          </ManbaIzoh>
        </Card>
      </div>

      {/* Tezkor havolalar */}
      <div className="grid cols-2" style={{ gap: 20 }}>
        {HAVOLALAR.map((h) => {
          const IconCmp = Icon[h.icon] || Icon.folder;
          return (
            <Link key={h.href} href={h.href} className="card row-click" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <IconCmp width={20} height={20} aria-hidden="true" style={{ color: 'var(--primary-dark)', flexShrink: 0 }} />
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
