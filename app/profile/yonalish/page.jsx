'use client';

import { PageHead, Card, StatCard, Badge, InfoBanner, RefTable } from '../../../components/ui.jsx';
import {
  HUQUQIY_ASOS,
  MILLIY_SERTIFIKAT,
  KELAJAK_YOLI,
  MAKTAB_FAKTLAR,
} from '../../../lib/oquvchi-malumotlar';

// Maktab o'quvchisi uchun «Tibbiyotga yo'l» sahifasi — rasmiy hujjatlar va
// imtiyozlar asosidagi yo'l xaritasi (manbalar: lex.uz, yuz.uz, piima.uz).

// Tile yorliqlari bir satrda turishi uchun qisqartirilgan (KPI qatorining bazasi buzilmasin);
// tafsilot caption'ga o'tdi, qiymat (150 ta / 14 ta) lib'dagi faktdan olinadi. Indeks MAKTAB_FAKTLAR tartibi bilan.
const TILE_KORINISHI = [
  { label: 'Ixtisoslashtirilgan maktablar', izoh: 'kimyo-biologiya, tuman va shahar markazlarida (PQ-4805)', icon: 'building', tone: 'primary' },
  { label: 'Tayanch maktablar', izoh: 'har bir hududda bittadan', icon: 'flag', tone: 'teal' },
  { icon: 'users', tone: 'violet' },
  { icon: 'laptop', tone: 'success' },
];

export default function YonalishPage() {
  const tilelar = MAKTAB_FAKTLAR.map((f, i) => ({ ...f, ...(TILE_KORINISHI[i] || {}) }));

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Kabinet', href: '/profile' }, { label: 'Tibbiyotga yo‘l' }]}
        title="Tibbiyotga yo‘l"
        badge={<Badge tone="neutral">O‘quvchi</Badge>}
        subtitle="Kimyo-biologiya sinfidan tibbiyot OTMigacha — rasmiy imkoniyatlar va imtiyozlar xaritasi"
      />

      <InfoBanner
        maqsad="Chuqurlashtirilgan sinf o‘quvchisini uzluksiz tibbiy ta‘lim zanjirining keyingi bosqichlariga ongli tayyorlash."
        ishlar="Milliy sertifikat olish, texnikum yoki bakalavriatni tanlash, DTM imtiyozlaridan foydalanish."
        manba="PQ-4805 (12.08.2020), PQ-4666 (07.04.2020), yuz.uz, ariza.piima.uz."
      />

      {/* Ixtisoslashtirilgan maktablar tarmog'i — real raqamlar */}
      <div className="grid stat-grid" style={{ marginBottom: 18 }}>
        {tilelar.map((f) => (
          <StatCard
            key={f.label}
            label={f.label}
            value={f.qiymat}
            caption={f.izoh}
            icon={f.icon}
            tone={f.tone}
          />
        ))}
      </div>

      {/* Yo'l xaritasi */}
      <Card title="Uch qadamlik yo‘l xaritasi" extra="Rasmiy imtiyozlar bilan">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {KELAJAK_YOLI.map((q, i) => (
            <div key={q.bosqich} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
              <span
                style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--primary-soft)', color: 'var(--primary-dark)',
                  fontSize: 14, fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 15 }}>{q.bosqich}</b>
                  <Badge tone={q.tone}>{q.badge}</Badge>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55 }}>{q.tavsif}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        {/* Milliy sertifikat imtiyozlari */}
        <Card title="Milliy sertifikat — imtiyozlar" extra="Kimyo · Biologiya">
          <RefTable
            head={['Shart', 'Imtiyoz']}
            rows={[
              ['OTMga kirish', MILLIY_SERTIFIKAT.imtiyoz],
              ['Ball hisobi', MILLIY_SERTIFIKAT.ballar],
              ['Amal muddati', MILLIY_SERTIFIKAT.muddat],
              ['Tibbiyot yo‘nalishi', MILLIY_SERTIFIKAT.tibbiyot],
            ]}
          />
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 2px 0' }}>
            Manba:{' '}
            <a href={MILLIY_SERTIFIKAT.manba} target="_blank" rel="noopener" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
              yuz.uz — rasmiy xabar
            </a>
          </p>
        </Card>

        {/* Huquqiy asos */}
        <Card title="Huquqiy asos" extra={`${HUQUQIY_ASOS.length} ta hujjat`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HUQUQIY_ASOS.map((h) => (
              <div key={h.hujjat} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  {/* Hujjat raqami — identifikator, holat emas: neytral nishoncha */}
                  <Badge tone="neutral">{h.hujjat}</Badge>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{h.sana}</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{h.nomi}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 6 }}>{h.mazmun}</div>
                <a href={h.url} target="_blank" rel="noopener" style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600 }}>
                  lex.uz da o‘qish →
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="elon-banner">
        <span className="elon-banner__ikon">💡</span>
        <div>
          <b>Maslahat:</b> ixtisoslashtirilgan maktablarga hujjatlar odatda 1–20 iyun oralig‘ida{' '}
          <a href="https://ariza.piima.uz" target="_blank" rel="noopener" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
            ariza.piima.uz
          </a>{' '}
          orqali onlayn topshiriladi. Abu Ali ibn Sino nomidagi ixtisoslashtirilgan maktabga qabul 7-sinfdan, tanlov asosida.
        </div>
      </div>
    </>
  );
}
