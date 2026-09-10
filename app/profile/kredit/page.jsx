'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHead, Card, StatCard, Badge, Progress, DataTable } from '../../../components/ui.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getKreditlar } from '../../../lib/data-service';

const YILLIK_NORMA = 50;
const BESH_YILLIK_NORMA = 250;

// Sarlavhadagi rol nishonchasi: TDTU talabasi / chuqurlashtirilgan sinf o'quvchisi / shifokor
const rolNomi = (p) =>
  p?.rol === 'talaba' ? 'Talaba' : p?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf' ? 'O‘quvchi' : 'Shifokor';

// Kurslar tarixi — bitta jadval: kurs (qator sarlavhasi) · tashkilot · sertifikat (mono) · sana · ball (o'ngga)
const USTUNLAR = [
  { key: 'kurs_nomi', label: 'Kurs', rowHeader: true },
  { key: 'tashkilot_nomi', label: 'Tashkilot' },
  { key: 'sertifikat_raqami', label: 'Sertifikat', mono: true },
  { key: 'topshirilgan_sana', label: 'Sana', numeric: true, mono: true },
  { key: 'kredit_ball', label: 'Ball', numeric: true },
];

export default function KreditPage() {
  const [profil, setProfil] = useState(null);
  const [kreditlar, setKreditlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      setProfil(p);
      setKreditlar(await getKreditlar(p.id));
      setYuklanmoqda(false);
    })();
  }, []);

  const joriyYil = new Date().getFullYear();
  const jamiBall = kreditlar.reduce((s, c) => s + (c.kredit_ball || 0), 0);
  const yillikBall = kreditlar
    .filter((c) => new Date(c.topshirilgan_sana).getFullYear() === joriyYil)
    .reduce((s, c) => s + (c.kredit_ball || 0), 0);
  const yillikQolgan = Math.max(0, YILLIK_NORMA - yillikBall);
  const tsiklFoiz = Math.min(100, Math.round((jamiBall / BESH_YILLIK_NORMA) * 100));

  // Yangi kurslar birinchi — yil kesimi Sana ustunida ko'rinadi
  const qatorlar = useMemo(
    () => [...kreditlar].sort((a, b) => String(b.topshirilgan_sana).localeCompare(String(a.topshirilgan_sana))),
    [kreditlar]
  );

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'UKTT kreditlari' }]}
        title="UKTT kreditlari"
        badge={profil ? <Badge tone="neutral">{rolNomi(profil)}</Badge> : undefined}
        subtitle="UKTT kredit ballari — yillik (50) va 5 yillik (250) norma monitoringi"
      />

      {/* Tile'lar pastdagi progress kartalarini takrorlamaydi: qolgan ball va tsikl foizi */}
      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        <StatCard label="Yillik normaga qolgan" value={yuklanmoqda ? '…' : yillikQolgan} caption={`ball · ${joriyYil}-yil, norma ${YILLIK_NORMA}`} icon="credit" tone="primary" />
        <StatCard label="5 yillik tsikl bajarilishi" value={yuklanmoqda ? '…' : `${tsiklFoiz}%`} caption={`${BESH_YILLIK_NORMA} ball talab etiladi`} icon="chart" tone="teal" />
        <StatCard label="Kurslar soni" value={yuklanmoqda ? '…' : kreditlar.length} icon="book" tone="violet" />
        <StatCard label="Sertifikatlar" value={yuklanmoqda ? '…' : kreditlar.filter((c) => c.sertifikat_raqami).length} icon="certificate" tone="success" />
      </div>

      <div className="grid cols-2" style={{ marginBottom: 18, alignItems: 'start' }}>
        <Card title="Yillik norma ijrosi" extra={`Norma: ${YILLIK_NORMA} ball`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>{joriyYil}-yil bajarilishi</span>
            <b style={{ fontSize: 17 }}>{yillikBall} / {YILLIK_NORMA}</b>
          </div>
          <Progress value={yillikBall} max={YILLIK_NORMA} />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
            Qolgan: {yillikQolgan} ball
          </div>
        </Card>

        <Card title="5 yillik tsikl ijrosi" extra="TFX yangilash sharti">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Jami to‘plangan</span>
            <b style={{ fontSize: 17 }}>{jamiBall} / {BESH_YILLIK_NORMA}</b>
          </div>
          <Progress value={jamiBall} max={BESH_YILLIK_NORMA} />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
            Malaka toifasi (TFX sertifikati)ni yangilash uchun 5 yillik davrda {BESH_YILLIK_NORMA} ball talab etiladi
          </div>
        </Card>
      </div>

      <Card title="Kredit ballari tarixi" extra={yuklanmoqda ? undefined : `${kreditlar.length} ta kurs`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : (
          <DataTable
            numbered
            columns={USTUNLAR}
            rows={qatorlar}
            totals={kreditlar.length ? { kredit_ball: jamiBall } : undefined}
            footnote="Manba: TIPME kurs reyestri — ballar kurs topshirilganda avtomatik qo‘shiladi."
            empty="Hozircha kredit yozuvlari yo‘q. Kurslar TIPME orqali topshirilganda ballar avtomatik qo‘shiladi."
          />
        )}
      </Card>
    </>
  );
}
