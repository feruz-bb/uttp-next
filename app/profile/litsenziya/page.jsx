'use client';

import React, { useState, useEffect } from 'react';
import { PageHead, Card, Badge, Progress, InfoBanner } from '../../../components/ui.jsx';
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

const qolganKunlar = (muddat) => Math.ceil((new Date(muddat) - new Date()) / (1000 * 60 * 60 * 24));

// 5 yillik tsiklning necha foizi o'tgani
function tsiklFoizi(berilgan, muddat) {
  const boshi = new Date(berilgan).getTime();
  const oxiri = new Date(muddat).getTime();
  if (oxiri <= boshi) return 100;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - boshi) / (oxiri - boshi)) * 100)));
}

export default function LitsenziyaPage() {
  const [litsenziyalar, setLitsenziyalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    (async () => {
      const p = (await joriyProfilniOl()) || INITIAL_PROFILES[0];
      setLitsenziyalar(await getLitsenziyalar(p.id));
      setYuklanmoqda(false);
    })();
  }, []);

  return (
    <>
      <PageHead
        title="TFX litsenziyasi"
        subtitle="Malaka toifasi va litsenziyalar — 5 yillik tsikl monitoringi (tibtoifa.uz)"
      />

      <InfoBanner
        maqsad="TFX litsenziyasi har 5 yilda yangilanadi — davr ichida 250 UKTT kredit ball to‘planishi va attestatsiyadan o‘tish talab etiladi."
        ishlar="Muddati tugashiga 6 oy qolganda tizim avtomatik ogohlantiradi; muddati o‘tgan litsenziya bilan faoliyat yuritish cheklanadi."
        manba="Tibbiyot va farmatsevtika xodimlarini baholash markazi (tibtoifa.uz), UKTT kredit moduli."
      />

      <Card title="Litsenziyalar ro'yxati" extra={`${litsenziyalar.length} ta`}>
        {yuklanmoqda ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>Yuklanmoqda...</div>
        ) : litsenziyalar.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            Litsenziya yozuvlari topilmadi.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {litsenziyalar.map((lic) => {
              const kunlar = qolganKunlar(lic.amal_qilish_muddati);
              const foiz = tsiklFoizi(lic.berilgan_sana, lic.amal_qilish_muddati);
              return (
                <div key={lic.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div className="mono" style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 15.5, marginBottom: 3 }}>
                        {lic.tfx_raqami}
                      </div>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{lic.mutaxassislik}</div>
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
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>
                    {kunlar >= 0 ? (
                      <>Amal qilish muddatiga <b>{kunlar} kun</b> qoldi (5 yillik tsikl)</>
                    ) : (
                      <span style={{ color: 'var(--danger)' }}>
                        Muddati <b>{Math.abs(kunlar)} kun</b> avval tugagan — yangilash uchun TFX markaziga murojaat qiling
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
