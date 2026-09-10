// Grafiklar uchun umumiy yordamchilar — barcha dashboard bo'limlari shu yerdan oladi.
// Qoidalar: dataviz skill + uttp-design-system (chartColors tartibi qat'iy, pie/donut yo'q,
// 6+ kategoriya → sekvensial turquoise rampa, tooltip faqat chartTip).
import { theme, chartColors, chartGray } from './theme.js';

export { chartColors, chartGray };

// Raqam formati: 27 739 (ru-RU bo'sh joy ajratgich — loyihada shu qabul qilingan)
export const fmt = (n) => (n ?? 0).toLocaleString('ru-RU');

// Foiz (bir xona): foiz(58, 100) → 58, foiz(14150, 24382) → 58.0
export const foiz = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

// Qisqa raqam: 27 739 → 27,7K
export const qisqa = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}K`;
  return fmt(v);
};

// Recharts o'q va to'r uslublari — recessiv, hairline, chiziqli (dashed EMAS)
export const axisStyle = { fontSize: 11, fill: theme.muted };
export const gridStroke = theme.line;
export const cursorFill = { fill: 'rgba(17,24,39,0.04)' };

// Ustun/bar qalinligi cheklovi (dataviz: ≤ 24px) va yumaloq ma'lumot uchi
export const BAR_MAX = 22;
export const RADIUS_H = [0, 4, 4, 0]; // gorizontal bar uchi
export const RADIUS_V = [4, 4, 0, 0]; // vertikal ustun uchi

// Sekvensial turquoise rampa: #d5edea → #0f6b62 (uttp-design-system).
// n ta qadam qaytaradi (och → to'q). Tartibli kategoriyalar (kurs, bosqich) va
// 6+ toifali kategoriyalar uchun; nominal kategoriyalarga QO'LLANMAYDI (bitta rang).
const RAMP_A = [0xd5, 0xed, 0xea];
const RAMP_B = [0x0f, 0x6b, 0x62];
const hex = (v) => Math.round(v).toString(16).padStart(2, '0');
export function ramp(n) {
  if (n <= 1) return [`#${RAMP_B.map(hex).join('')}`];
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return `#${RAMP_A.map((a, k) => hex(a + (RAMP_B[k] - a) * t)).join('')}`;
  });
}

// Uzun kategoriya nomlarini o'qda qisqartirish
export const qisqart = (max) => (v) => (v && v.length > max ? `${v.slice(0, max - 1)}…` : v);

// Grafik sarlavhasi (karta ichida bir nechta grafik bo'lganda)
export function GrafikSarlavha({ children, izoh }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{children}</div>
      {izoh && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{izoh}</div>}
    </div>
  );
}

// Manba izohi — grafik ostida
export function ManbaIzoh({ children }) {
  return <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>{children}</div>;
}
