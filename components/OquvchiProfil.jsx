'use client';

import TalimTimeline from './TalimTimeline';
import IlmFanBolimi from './story/IlmFanBolimi';
import { PageHead, Card, StatCard, Badge, SummaryList, hududNomi } from './ui.jsx';
import { KELAJAK_YOLI, CHUQUR_FANLAR, MILLIY_SERTIFIKAT } from '../lib/oquvchi-malumotlar';

// Maktab o'quvchisi (kimyo-biologiya chuqurlashtirilgan sinf) uchun profil ko'rinishi.
// Shifokor kabinetidagi TFX/UKTT bloklari o'rniga — sinf, fanlar va tibbiyotga yo'l.

// Har bir fanning o'z izohi (lib'dagi umumiy izoh ikkala qatorda bir xil edi; lib ochilganda u yerga ko'chadi)
const FAN_IZOH = {
  Kimyo: 'Organik va anorganik kimyo, chuqurlashtirilgan dastur + laboratoriya amaliyoti',
  Biologiya: 'Anatomiya, fiziologiya va genetika, chuqurlashtirilgan dastur + laboratoriya amaliyoti',
};

export default function OquvchiProfil({ profile }) {
  const sinf = profile.hozirgi_kurs ? `${profile.hozirgi_kurs}-sinf` : '—';

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Shaxsiy profil' }]}
        title={`Salom, ${profile.fish?.split(' ')[1] || profile.fish}!`}
        badge={<Badge tone="neutral">O‘quvchi</Badge>}
        subtitle={`${sinf} o‘quvchisi · ${profile.hozirgi_muassasa || 'Kimyo-biologiya chuqurlashtirilgan sinf'}`}
      />

      {/* Maqsad banneri */}
      <div className="elon-banner" style={{ marginBottom: 18 }}>
        <span className="elon-banner__ikon">🎯</span>
        <div>
          <b>Maqsad — tibbiyot!</b>{' '}
          Maktabni tugatguncha kimyo va biologiyadan milliy sertifikat olsangiz, OTMga kirishda
          shu fanlar testidan ozod bo‘lasiz (sertifikat 3 yil amal qiladi).
        </div>
      </div>

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Joriy sinf" value={sinf} icon="book" tone="primary" />
        <StatCard label="Yo‘nalish" value="Kimyo–Biologiya" icon="flask" tone="teal" />
        <StatCard label="Milliy sertifikat" value="Tayyorgarlik" icon="certificate" tone="warning" />
        <StatCard label="Keyingi bosqich" value="Texnikum / OTM" icon="flag" tone="violet" />
      </div>

      {/* Ta'lim trayektoriyasi — zanjirning boshidasiz */}
      <TalimTimeline hozirgiBosqich="chuqurlashtirilgan_sinf" />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        {/* Profil ma'lumotlari */}
        <Card title="Profil ma’lumotlari">
          <SummaryList
            items={[
              { label: 'F.I.SH.', value: profile.fish },
              { label: 'Maktab', value: profile.hozirgi_muassasa },
              { label: 'Sinf', value: sinf },
              { label: 'Hudud', value: hududNomi(profile.manzil_viloyat_id, profile.manzil_tuman) },
              { label: 'Email', value: profile.email },
              { label: 'Telefon', value: profile.telefon },
              { label: 'JSHSHIR', value: profile.jshshir, mono: true },
            ]}
          />
        </Card>

        {/* Chuqurlashtirilgan fanlar */}
        <Card title="Chuqurlashtirilgan fanlar" extra="PQ-4805 dasturi">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CHUQUR_FANLAR.map((f) => (
              <div key={f.fan} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{f.fan}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{FAN_IZOH[f.fan] || f.izoh}</div>
                </div>
                {/* Fan bo'yicha milliy sertifikat holati — yuqoridagi tile bilan bir xil manba */}
                <Badge tone="neutral" variant="dot">Sertifikat: tayyorgarlik</Badge>
              </div>
            ))}
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              {MILLIY_SERTIFIKAT.tibbiyot}. {MILLIY_SERTIFIKAT.ballar}.
            </div>
          </div>
        </Card>
      </div>

      {/* Tibbiyotga yo'l — qisqa xarita */}
      <Card title="Tibbiyotga yo‘lim" extra="Batafsil: «Tibbiyotga yo‘l» bo‘limida">
        <div className="grid cols-3" style={{ gap: 14 }}>
          {KELAJAK_YOLI.map((q, i) => (
            <div key={q.bosqich} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--primary-soft)', color: 'var(--primary-dark)',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <b style={{ fontSize: 14 }}>{q.bosqich}</b>
                <span style={{ marginLeft: 'auto' }}><Badge tone={q.tone}>{q.badge}</Badge></span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{q.tavsif}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Canvas 3-yo'nalish — har kabinetda alohida bo'lim */}
      <IlmFanBolimi profile={profile} />
    </>
  );
}
