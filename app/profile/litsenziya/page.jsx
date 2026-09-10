'use client';

import { useState, useEffect } from 'react';
import { PageHead, Card, StatCard, Badge, Progress, InfoBanner, SummaryList } from '../../../components/ui.jsx';
import { joriyProfilniOl } from '../../../lib/auth';
import { INITIAL_PROFILES, getLitsenziyalar } from '../../../lib/data-service';

const HOLAT_TONE = {
  amal_qilmoqda: 'success',
  muddati_tugayapti: 'warning',
  muddati_otgan: 'danger',
};
const HOLAT_MATN = {
  amal_qilmoqda: 'Amal qilmoqda',
  muddati_tugayapti: 'Muddati tugayapti',
  muddati_otgan: 'Muddati o‘tgan',
};
const TOIFA_NOMLARI = { oliy: 'Oliy toifa', birinchi: 'Birinchi toifa', ikkinchi: 'Ikkinchi toifa', mutaxassis: 'Mutaxassis' };
// StatCard ikonka toni (StatCard'da danger yo'q — accent ishlatiladi)
const TILE_TONE = { amal_qilmoqda: 'success', muddati_tugayapti: 'warning', muddati_otgan: 'accent' };

const qolganKunlar = (muddat) => Math.ceil((new Date(muddat) - new Date()) / (1000 * 60 * 60 * 24));

// Sarlavhadagi rol nishonchasi: TDTU talabasi / chuqurlashtirilgan sinf o'quvchisi / shifokor
const rolNomi = (p) =>
  p?.rol === 'talaba' ? 'Talaba' : p?.hozirgi_bosqich === 'chuqurlashtirilgan_sinf' ? 'O‘quvchi' : 'Shifokor';

// 5 yillik tsiklning necha foizi o'tgani
function tsiklFoizi(berilgan, muddat) {
  const boshi = new Date(berilgan).getTime();
  const oxiri = new Date(muddat).getTime();
  if (oxiri <= boshi) return 100;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - boshi) / (oxiri - boshi)) * 100)));
}

export default function LitsenziyaPage() {
  const [profil, setProfil] = useState(null);
  const [litsenziyalar, setLitsenziyalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      setProfil(p);
      setLitsenziyalar(await getLitsenziyalar(p.id));
      setYuklanmoqda(false);
    })();
  }, []);

  // Tile'lar uchun joriy (muddati o'tmagan, bo'lmasa oxirgi) sertifikat
  const faol = litsenziyalar.find((l) => l.holati !== 'muddati_otgan') || litsenziyalar[0] || null;
  const faolKunlar = faol ? qolganKunlar(faol.amal_qilish_muddati) : null;
  const tile = (qiymat) => (yuklanmoqda ? '…' : qiymat ?? '—');

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Malaka toifasi' }]}
        title="Malaka toifasi va attestatsiya"
        badge={profil ? <Badge tone="neutral">{rolNomi(profil)}</Badge> : undefined}
        subtitle="TFX malaka sertifikati — 5 yillik tsikl monitoringi"
      />

      <InfoBanner
        maqsad="Malaka toifasi sertifikati 5 yil amal qiladi — davr ichida UKTT kreditlarini to‘plash va attestatsiyadan qayta o‘tish talab etiladi. Toifa olish uchun staj: ikkinchi toifa — 3 yil, birinchi — 5 yil, oliy — 7 yil."
        ishlar="Muddati tugashiga 6 oy qolganda tizim avtomatik ogohlantiradi. Eslatma: litsenziya faqat tibbiyot tashkilotlariga beriladi — shaxsiy shifokor darajasi malaka toifasi orqali tasdiqlanadi."
        manba="Tibbiyot va farmatsevtika xodimlari malakasini baholash markazi (tibtoifa.uz), UKTT kredit moduli."
      />

      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        <StatCard label="Malaka toifasi" value={tile(faol ? TOIFA_NOMLARI[faol.toifa] || faol.toifa : null)} icon="award" tone="violet" />
        <StatCard label="Amal qilish muddati" value={tile(faol?.amal_qilish_muddati)} icon="calendar" tone="primary" />
        <StatCard label="Qolgan kun" value={tile(faol ? Math.max(0, faolKunlar) : null)} caption={faol ? '5 yillik tsikl' : undefined} icon="clock" tone="teal" />
        <StatCard label="Holat" value={tile(faol ? HOLAT_MATN[faol.holati] || faol.holati : null)} icon="shield" tone={faol ? TILE_TONE[faol.holati] || 'success' : 'success'} />
      </div>

      <Card title="Malaka sertifikatlari" extra={yuklanmoqda ? undefined : `${litsenziyalar.length} ta`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : litsenziyalar.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Malaka sertifikati yozuvlari topilmadi.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {litsenziyalar.map((lic) => {
              const kunlar = qolganKunlar(lic.amal_qilish_muddati);
              const foiz = tsiklFoizi(lic.berilgan_sana, lic.amal_qilish_muddati);
              return (
                <div key={lic.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 18 }}>
                  {/* Sarlavha: TFX raqami + nishonchalar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 15.5 }}>
                      {lic.tfx_raqami}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {lic.toifa && <Badge tone="violet">{TOIFA_NOMLARI[lic.toifa] || lic.toifa}</Badge>}
                      <Badge tone={HOLAT_TONE[lic.holati] || 'info'}>{HOLAT_MATN[lic.holati] || lic.holati}</Badge>
                    </div>
                  </div>

                  {/* 5 yillik tsikl progressi */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
                    <span>{lic.berilgan_sana}</span>
                    <b>{foiz}% o‘tdi</b>
                    <span>{lic.amal_qilish_muddati}</span>
                  </div>
                  <Progress
                    value={foiz}
                    tone={lic.holati === 'amal_qilmoqda' ? 'var(--success)' : lic.holati === 'muddati_tugayapti' ? 'var(--warning)' : 'var(--danger)'}
                  />

                  {/* Sertifikat tafsilotlari — dt/dd qatorlari */}
                  <SummaryList
                    className="summary-list--ichki"
                    items={[
                      { label: 'Mutaxassislik', value: lic.mutaxassislik },
                      { label: 'Toifa', value: lic.toifa ? TOIFA_NOMLARI[lic.toifa] || lic.toifa : null },
                      { label: 'Berilgan sana', value: lic.berilgan_sana, mono: true },
                      { label: 'Amal qilish muddati', value: lic.amal_qilish_muddati, mono: true },
                      {
                        label: 'Qolgan',
                        value:
                          kunlar >= 0 ? (
                            <><b>{kunlar} kun</b> (5 yillik tsikl)</>
                          ) : (
                            <span style={{ color: 'var(--danger)' }}>
                              Muddati <b>{Math.abs(kunlar)} kun</b> avval tugagan — qayta attestatsiya uchun TFX baholash markaziga murojaat qiling
                            </span>
                          ),
                      },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
