'use client';

import React, { useState, useEffect } from 'react';
import { PageHead, Card, StatCard, Badge, Progress } from '../../../components/ui.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getKreditlar } from '../../../lib/data-service';

const YILLIK_NORMA = 50;
const BESH_YILLIK_NORMA = 250;

export default function KreditPage() {
  const [kreditlar, setKreditlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      setKreditlar(await getKreditlar(p.id));
      setYuklanmoqda(false);
    })();
  }, []);

  const joriyYil = new Date().getFullYear();
  const jamiBall = kreditlar.reduce((s, c) => s + (c.kredit_ball || 0), 0);
  const yillikBall = kreditlar
    .filter((c) => new Date(c.topshirilgan_sana).getFullYear() === joriyYil)
    .reduce((s, c) => s + (c.kredit_ball || 0), 0);

  // Yillar kesimida guruhlash (yangi yillar birinchi)
  const yillarBoyicha = kreditlar.reduce((acc, c) => {
    const yil = new Date(c.topshirilgan_sana).getFullYear();
    (acc[yil] = acc[yil] || []).push(c);
    return acc;
  }, {});
  const yillar = Object.keys(yillarBoyicha).sort((a, b) => b - a);

  return (
    <>
      <PageHead
        title="Kredit hisobi"
        subtitle="UKTT kredit ballari — yillik (50) va 5 yillik (250) norma monitoringi"
      />

      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        <StatCard label={`${joriyYil}-yil krediti`} value={`${yillikBall} / ${YILLIK_NORMA}`} icon="credit" tone="primary" />
        <StatCard label="5 yillik jami" value={`${jamiBall} / ${BESH_YILLIK_NORMA}`} icon="chart" tone="teal" />
        <StatCard label="Kurslar soni" value={kreditlar.length} icon="book" tone="violet" />
        <StatCard label="Sertifikatlar" value={kreditlar.filter((c) => c.sertifikat_raqami).length} icon="certificate" tone="success" />
      </div>

      <div className="grid cols-2" style={{ marginBottom: 18, alignItems: 'start' }}>
        <Card title="Yillik norma ijrosi" extra={`Norma: ${YILLIK_NORMA} ball`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>{joriyYil}-yil bajarilishi</span>
            <b style={{ fontSize: 17 }}>{yillikBall} / {YILLIK_NORMA}</b>
          </div>
          <Progress value={yillikBall} max={YILLIK_NORMA} />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
            Qolgan: {Math.max(0, YILLIK_NORMA - yillikBall)} ball
          </div>
        </Card>

        <Card title="5 yillik tsikl ijrosi" extra="TFX yangilash sharti">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Jami to‘plangan</span>
            <b style={{ fontSize: 17 }}>{jamiBall} / {BESH_YILLIK_NORMA}</b>
          </div>
          <Progress value={jamiBall} max={BESH_YILLIK_NORMA} />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
            Litsenziyani yangilash uchun 5 yillik davrda {BESH_YILLIK_NORMA} ball talab etiladi
          </div>
        </Card>
      </div>

      <Card title="Kredit ballari tarixi" extra={`${kreditlar.length} ta kurs`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : kreditlar.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Hozircha kredit yozuvlari yo‘q. Kurslar TIPME orqali topshirilganda ballar avtomatik qo‘shiladi.
          </div>
        ) : (
          yillar.map((yil) => {
            const yilKreditlari = yillarBoyicha[yil];
            const yilJami = yilKreditlari.reduce((s, c) => s + (c.kredit_ball || 0), 0);
            return (
              <div key={yil} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <b style={{ fontSize: 14.5 }}>{yil}-yil</b>
                  <Badge tone="info">{yilJami} ball</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {yilKreditlari.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.kurs_nomi}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {c.tashkilot_nomi} · {c.sertifikat_raqami || 'sertifikatsiz'} · {c.topshirilgan_sana}
                        </div>
                      </div>
                      <Badge tone="success">+{c.kredit_ball}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}
