'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHead, Card, StatCard, Badge, DataTable } from '../../../components/ui.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getTalimTarixi, getLitsenziyalar, getKreditlar } from '../../../lib/data-service';

const TUR_DIPLOM = 'Diplom';
const TUR_TFX = 'TFX sertifikati';
const TUR_UKTT = 'UKTT sertifikati';
const TUR_TONE = { [TUR_DIPLOM]: 'info', [TUR_TFX]: 'success', [TUR_UKTT]: 'warning' };
// Hujjat turi → manba yozuvi turgan sahifa (qator bosilganda o'tiladi)
const TUR_SAHIFA = { [TUR_DIPLOM]: '/profile/talim', [TUR_TFX]: '/profile/litsenziya', [TUR_UKTT]: '/profile/kredit' };
const TOIFA_NOMLARI = { oliy: 'Oliy toifa', birinchi: 'Birinchi toifa', ikkinchi: 'Ikkinchi toifa', mutaxassis: 'Mutaxassis' };

// Sarlavhadagi rol nishonchasi: TDTU talabasi / chuqurlashtirilgan sinf o'quvchisi / shifokor
const rolNomi = (p) =>
  p?.rol === 'talaba' ? 'Talaba' : p?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf' ? 'O‘quvchi' : 'Shifokor';

const columns = [
  { key: 'raqam', label: 'Hujjat raqami', mono: true },
  { key: 'tur', label: 'Turi', badge: TUR_TONE },
  { key: 'nomi', label: 'Hujjat nomi' },
  { key: 'sana', label: 'Berilgan sana', numeric: true },
];

export default function HujjatlarPage() {
  const router = useRouter();
  const [profil, setProfil] = useState(null);
  const [hujjatlar, setHujjatlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      setProfil(p);
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
            tur: TUR_DIPLOM,
            raqam: t.diplom_raqami,
            nomi: `${t.muassasa_nomi}${t.yonalish_nomi ? ` — ${t.yonalish_nomi}` : ''}`,
            sana: t.diplom_sanasi || String(t.tugatilgan_yil || t.boshlangan_yil),
          })),
        ...litsenziyalar.map((l) => ({
          id: `l-${l.id}`,
          tur: TUR_TFX,
          raqam: l.tfx_raqami,
          nomi: `${l.mutaxassislik}${l.toifa ? ` — ${TOIFA_NOMLARI[l.toifa] || l.toifa}` : ''}`,
          sana: l.berilgan_sana,
        })),
        ...kreditlar
          .filter((c) => c.sertifikat_raqami)
          .map((c) => ({
            id: `s-${c.id}`,
            tur: TUR_UKTT,
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
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Hujjatlarim' }]}
        title="Hujjatlarim"
        badge={profil ? <Badge tone="neutral">{rolNomi(profil)}</Badge> : undefined}
        subtitle="Diplomlar, TFX malaka sertifikatlari va UKTT sertifikatlari — yagona elektron ombor"
      />

      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        <StatCard label="Jami hujjatlar" value={yuklanmoqda ? '…' : hujjatlar.length} icon="folder" tone="primary" />
        <StatCard label="Diplomlar" value={yuklanmoqda ? '…' : soni(TUR_DIPLOM)} icon="book" tone="violet" />
        <StatCard label="TFX sertifikatlari" value={yuklanmoqda ? '…' : soni(TUR_TFX)} icon="shield" tone="success" />
        <StatCard label="UKTT sertifikatlari" value={yuklanmoqda ? '…' : soni(TUR_UKTT)} icon="certificate" tone="warning" />
      </div>

      <Card title="Hujjatlar ro‘yxati" subtitle="Qatorni bosib manba yozuviga o‘ting" extra={yuklanmoqda ? undefined : `${hujjatlar.length} ta`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : (
          <DataTable
            searchable
            numbered
            columns={columns}
            rows={hujjatlar}
            onRowClick={(r) => router.push(TUR_SAHIFA[r.tur] || '/profile')}
            footnote="Manba: HEMIS (diplomlar), tibtoifa.uz (TFX sertifikatlari), TIPME (UKTT sertifikatlari)."
            empty="Hujjatlar topilmadi. Ta‘lim tarixi va sertifikatlar qo‘shilganda bu yerda ko‘rinadi."
          />
        )}
      </Card>
    </>
  );
}
