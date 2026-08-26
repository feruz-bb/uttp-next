'use client';

import React, { useState, useEffect } from 'react';
import { PageHead, Card, StatCard, DataTable } from '../../../components/ui.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getTalimTarixi, getLitsenziyalar, getKreditlar } from '../../../lib/data-service';

const TUR_TONE = { Diplom: 'info', 'TFX Litsenziya': 'success', 'UKTT Sertifikat': 'warning' };

const columns = [
  { key: 'raqam', label: 'Hujjat raqami', mono: true },
  { key: 'tur', label: 'Turi', badge: TUR_TONE },
  { key: 'nomi', label: 'Hujjat nomi' },
  { key: 'sana', label: 'Berilgan sana' },
];

export default function HujjatlarPage() {
  const [hujjatlar, setHujjatlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      const [talim, litsenziyalar, kreditlar] = await Promise.all([
        getTalimTarixi(p.id),
        getLitsenziyalar(p.id),
        getKreditlar(p.id),
      ]);

      setHujjatlar([
        ...talim
          .filter((t) => t.diplom_raqami)
          .map((t) => ({
            id: `d-${t.id}`,
            tur: 'Diplom',
            raqam: t.diplom_raqami,
            nomi: `${t.muassasa_nomi}${t.yonalish_nomi ? ` — ${t.yonalish_nomi}` : ''}`,
            sana: t.diplom_sanasi || String(t.tugatilgan_yil || t.boshlangan_yil),
          })),
        ...litsenziyalar.map((l) => ({
          id: `l-${l.id}`,
          tur: 'TFX Litsenziya',
          raqam: l.tfx_raqami,
          nomi: `${l.mutaxassislik}${l.toifa ? ` (${l.toifa} toifa)` : ''}`,
          sana: l.berilgan_sana,
        })),
        ...kreditlar
          .filter((c) => c.sertifikat_raqami)
          .map((c) => ({
            id: `s-${c.id}`,
            tur: 'UKTT Sertifikat',
            raqam: c.sertifikat_raqami,
            nomi: c.kurs_nomi,
            sana: c.topshirilgan_sana,
          })),
      ]);
      setYuklanmoqda(false);
    })();
  }, []);

  const soni = (tur) => hujjatlar.filter((h) => h.tur === tur).length;

  return (
    <>
      <PageHead
        title="Hujjatlarim"
        subtitle="Diplomlar, TFX litsenziyalari va UKTT sertifikatlari — yagona elektron ombor"
      />

      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        <StatCard label="Jami hujjatlar" value={hujjatlar.length} icon="folder" tone="primary" />
        <StatCard label="Diplomlar" value={soni('Diplom')} icon="book" tone="violet" />
        <StatCard label="TFX litsenziyalar" value={soni('TFX Litsenziya')} icon="shield" tone="success" />
        <StatCard label="UKTT sertifikatlar" value={soni('UKTT Sertifikat')} icon="certificate" tone="warning" />
      </div>

      <Card title="Hujjatlar ro'yxati" extra={`${hujjatlar.length} ta`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : (
          <DataTable
            searchable
            numbered
            columns={columns}
            rows={hujjatlar}
            empty="Hujjatlar topilmadi. Ta'lim tarixi va sertifikatlar qo'shilganda bu yerda ko'rinadi."
          />
        )}
      </Card>
    </>
  );
}
