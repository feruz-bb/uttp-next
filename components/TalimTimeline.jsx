'use client';

import React from 'react';

const BOSQICHLAR = [
  { id: 'chuqurlashtirilgan_sinf', label: 'Chuqurlashtirilgan sinf', icon: '🏫', desc: 'Biologiya va kimyo ixtisosligi' },
  { id: 'texnikum', label: 'Texnikum', icon: '📚', desc: 'Abu Ali ibn Sino jamoat salomatligi' },
  { id: 'bakalavr', label: 'Bakalavriat', icon: '🎓', desc: 'Oliy tibbiy ta‘lim (7 ta yo‘nalish)' },
  { id: 'magistr', label: 'Magistratura', icon: '🔬', desc: 'Mutaxassislik (26 ta shifr)' },
  { id: 'rezidentura', label: 'Rezidentura / Ordinatura', icon: '🏥', desc: 'Klinik amaliyot' },
  { id: 'doktor', label: 'Doktor (Shifokorlik)', icon: '🩺', desc: 'Amaliyotchi shifokor / UKTT va TFX litsenziya' },
  { id: 'doktarantura', label: 'Doktarantura (PhD / DSc)', icon: '💡', desc: 'OAK ilmiy ixtisosliklari' },
];

export default function TalimTimeline({ hozirgiBosqich = 'bakalavr' }) {
  const currentIndex = BOSQICHLAR.findIndex((b) => b.id === hozirgiBosqich);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card__head">
        <h3>Kasbiy va ta’lim trayektoriyasi</h3>
        <div className="card__head-right">
          <span>Bosqichma-bosqich rivojlanish zanjiri</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px' }}>
        {BOSQICHLAR.map((b, idx) => {
          const isCompleted = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const isUpcoming = currentIndex < idx;

          let badgeBg = 'var(--bg, #f1f5f9)';
          let badgeColor = 'var(--muted, #64748b)';
          let borderColor = 'var(--line, #e2e8f0)';

          if (isCompleted) {
            badgeBg = 'var(--success-soft, #dcfce7)';
            badgeColor = 'var(--success, #16a34a)';
            borderColor = '#86efac';
          } else if (isCurrent) {
            badgeBg = 'var(--primary-soft, #cffafe)';
            badgeColor = 'var(--primary-dark, #0e7490)';
            borderColor = '#06b6d4';
          }

          return (
            <div
              key={b.id}
              style={{
                background: isCurrent ? 'rgba(6, 182, 212, 0.04)' : '#fff',
                border: `1.5px solid ${borderColor}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                transition: 'transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: badgeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginBottom: '8px',
                }}
              >
                {b.icon}
              </div>
              <div style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'var(--primary-dark, #0e7490)' : 'inherit', marginBottom: '4px' }}>
                {b.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted, #737780)', lineHeight: 1.3 }}>
                {b.desc}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: badgeBg,
                  color: badgeColor,
                }}
              >
                {isCompleted ? '✓ Tamomlangan' : isCurrent ? '● Joriy bosqich' : '○ Keyingi qadam'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
