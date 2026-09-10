'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie, CartesianGrid,
} from 'recharts';
import { Card, StatCard, KpiStrip, Badge, DataTable } from '../ui.jsx';
import {
  chartColors, chartGray, fmt, foiz, axisStyle, gridStroke, cursorFill,
  BAR_MAX, RADIUS_H, RADIUS_V, ramp, qisqart, GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';

// «Doktorantura» tabi — TDTU doktorantlari (PhD / DSc / stajyor-tadqiqotchi), 2024–2026 qabul.
// Manba: docs/doktarantlar_tayanch_doktarant.xlsx → doktorant_stat / doktorant_rahbar_stat view'lari.
// Bu tabda foydalanuvchi so'roviga ko'ra 2–6 bo'lakli part-to-whole kesimlar DONUT ko'rinishida.

const MANBA = 'TDTU doktorantlar ro‘yxati · 04.09.2026';
const YIL = 2026;

// Bosqichlar — qat'iy tartib (chartColors shu tartibda beriladi)
const BOSQICHLAR = [
  { kalit: 'Tayanch doktorantura, PhD', nom: 'Tayanch PhD' },
  { kalit: 'Doktorantura, DSc', nom: 'DSc' },
  { kalit: 'Maqsadli tayanch doktorantura, PhD', nom: 'Maqsadli PhD' },
  { kalit: 'Stajyor-tadqiqotchi', nom: 'Stajyor-tadqiqotchi' },
];

// OAK shifri → yo'nalish guruhi (klassifikator bo'sh kelganda)
const TURI_FALLBACK = {
  '03.00.01': 'fundamental', '03.00.02': 'fundamental', '03.00.04': 'fundamental', '13.00.02': 'pedagogika',
  '14.00.01': 'jarrohlik', '14.00.02': 'fundamental', '14.00.03': 'terapevtik', '14.00.04': 'jarrohlik',
  '14.00.05': 'terapevtik', '14.00.06': 'terapevtik', '14.00.07': 'profilaktika', '14.00.08': 'jarrohlik',
  '14.00.09': 'pediatriya', '14.00.10': 'terapevtik', '14.00.11': 'terapevtik', '14.00.13': 'terapevtik',
  '14.00.14': 'jarrohlik', '14.00.15': 'fundamental', '14.00.16': 'fundamental', '14.00.17': 'fundamental',
  '14.00.18': 'terapevtik', '14.00.19': 'diagnostika', '14.00.20': 'fundamental', '14.00.21': 'stomatologiya',
  '14.00.22': 'jarrohlik', '14.00.23': 'hamshiralik', '14.00.24': 'fundamental', '14.00.25': 'diagnostika',
  '14.00.27': 'jarrohlik', '14.00.29': 'terapevtik', '14.00.30': 'profilaktika', '14.00.31': 'jarrohlik',
  '14.00.33': 'boshqaruv', '14.00.35': 'pediatriya', '14.00.36': 'terapevtik', '14.00.37': 'jarrohlik',
  '19.00.04': 'fundamental',
};
const TURI_NOMI = {
  terapevtik: 'Terapevtik', jarrohlik: 'Jarrohlik', pediatriya: 'Pediatriya', fundamental: 'Fundamental fanlar',
  diagnostika: 'Diagnostika', stomatologiya: 'Stomatologiya', profilaktika: 'Profilaktika va gigiyena',
  boshqaruv: 'Jamoat salomatligi va boshqaruv', hamshiralik: 'Hamshiralik', pedagogika: 'Pedagogika',
};
const YOSH_BINLAR = ['30 gacha', '30–34', '35–39', '40–44', '45+'];
const yoshBin = (y) => (y < 30 ? YOSH_BINLAR[0] : y < 35 ? YOSH_BINLAR[1] : y < 40 ? YOSH_BINLAR[2] : y < 45 ? YOSH_BINLAR[3] : YOSH_BINLAR[4]);

const foizMatn = (a, b) => `${String(foiz(a, b)).replace('.', ',')} %`;
const yoshMatn = (n) => (n ? String(Math.round(n * 10) / 10).replace('.', ',') : '—');

// ---- Donut: 2–6 bo'lak, o'rtada jami, legend'da ulush ----
// Hover: bo'lak yumshoq kattalashadi (CSS, pie markazidan), qolganlari xiralashadi,
// markazda o'sha bo'lakning soni va ulushi ko'rinadi; legend qatori ham xuddi shunday ajratadi.
function Donut({ rows, jami, izoh, ranglar, height = 240 }) {
  const [faol, setFaol] = useState(null);
  const data = rows.filter((r) => r.soni > 0).map((r, i) => ({
    ...r,
    yorliq: `${r.nom} · ${foizMatn(r.soni, jami)}`,
    rang: r.rang || ranglar[i],
  }));
  if (!data.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
        Ma‘lumot yuklanmoqda…
      </div>
    );
  }
  const faolQator = faol != null ? data[faol] : null;
  const legendFaol = (e) => setFaol(data.findIndex((d) => d.yorliq === e.value));
  return (
    <div className="donut" style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="soni"
            nameKey="yorliq"
            cx="50%"
            cy="42%"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={1.5}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
            labelLine={false}
            onMouseEnter={(_, i) => setFaol(i)}
            onMouseLeave={() => setFaol(null)}
          >
            {data.map((r, i) => (
              <Cell
                key={r.nom}
                fill={r.rang}
                className={faol == null ? 'donut__bolak' : faol === i ? 'donut__bolak donut__bolak--faol' : 'donut__bolak donut__bolak--xira'}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTip} formatter={(v, n) => [`${fmt(v)} nafar`, n]} />
          <Legend
            wrapperStyle={{ fontSize: 12.5, cursor: 'default' }}
            iconType="circle"
            verticalAlign="bottom"
            onMouseEnter={legendFaol}
            onMouseLeave={() => setFaol(null)}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Markazdagi jami / faol bo'lak — matn tokenlari, seriya rangi emas */}
      <div
        aria-hidden="true"
        className="donut__markaz"
        style={{
          position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', maxWidth: '46%',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{fmt(faolQator ? faolQator.soni : jami)}</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.25 }}>
          {faolQator ? `${faolQator.nom} · ${foizMatn(faolQator.soni, jami)}` : izoh}
        </div>
      </div>
    </div>
  );
}

export default function DoktorantBolim({ dokStat = [], rahbarStat = [], yonalishlar = [] }) {
  // ---- Klassifikator: shifr → turi ----
  const turiMap = useMemo(() => {
    const m = { ...TURI_FALLBACK };
    yonalishlar.forEach((y) => {
      if (y.bosqich === 'doktorantura' && y.turi) m[String(y.kodi)] = y.turi;
    });
    return m;
  }, [yonalishlar]);

  // ---- Asosiy yig'indilar ----
  const jami = useMemo(() => dokStat.reduce((a, r) => a + (r.soni || 0), 0), [dokStat]);
  const yuklandi = jami > 0;

  const bosqichKesimi = useMemo(
    () => BOSQICHLAR.map((b) => ({ nom: b.nom, soni: dokStat.filter((r) => r.bosqich === b.kalit).reduce((a, r) => a + r.soni, 0) })),
    [dokStat]
  );
  const daraja = useMemo(() => {
    const d = { PhD: 0, DSc: 0, Stajyor: 0 };
    dokStat.forEach((r) => { d[r.daraja] = (d[r.daraja] || 0) + r.soni; });
    return d;
  }, [dokStat]);

  const jins = useMemo(() => {
    const j = { ayol: 0, erkak: 0, nomalum: 0 };
    dokStat.forEach((r) => { j[r.jinsi === 'ayol' ? 'ayol' : r.jinsi === 'erkak' ? 'erkak' : 'nomalum'] += r.soni; });
    return j;
  }, [dokStat]);
  const jinsMalum = jins.ayol + jins.erkak;

  const qabul = useMemo(() => {
    const q = { 2026: 0, 2025: 0, 2024: 0, eski: 0 };
    dokStat.forEach((r) => { if (r.qabul_yili >= 2024) q[r.qabul_yili] += r.soni; else q.eski += r.soni; });
    return [
      { nom: '2026', soni: q[2026] }, { nom: '2025', soni: q[2025] }, { nom: '2024', soni: q[2024] }, { nom: '2022–2023', soni: q.eski },
    ];
  }, [dokStat]);

  const kursKesimi = useMemo(() => [1, 2, 3].map((k) => ({ nom: `${k}-kurs`, soni: dokStat.filter((r) => r.kurs === k).reduce((a, r) => a + r.soni, 0) })), [dokStat]);

  // ---- Yosh ----
  const yosh = useMemo(() => {
    let n = 0; let sum = 0;
    const binlar = Object.fromEntries(YOSH_BINLAR.map((b) => [b, 0]));
    dokStat.forEach((r) => {
      if (r.yosh == null) return;
      n += r.soni; sum += r.yosh * r.soni; binlar[yoshBin(r.yosh)] += r.soni;
    });
    return { n, ortacha: n ? sum / n : 0, qatorlar: YOSH_BINLAR.map((b) => ({ bin: b, soni: binlar[b] })) };
  }, [dokStat]);

  // ---- Ixtisosliklar ----
  const ixtisosliklar = useMemo(() => {
    const m = {};
    dokStat.forEach((r) => {
      const k = `${r.ixtisoslik_shifri}|${r.ixtisoslik}`;
      const x = (m[k] ||= { shifr: r.ixtisoslik_shifri, nom: r.ixtisoslik, PhD: 0, DSc: 0, Stajyor: 0, jami: 0, ayol: 0, jinsMalum: 0, yoshSum: 0, yoshN: 0 });
      x[r.daraja] += r.soni; x.jami += r.soni;
      if (r.jinsi === 'ayol') x.ayol += r.soni;
      if (r.jinsi) x.jinsMalum += r.soni;
      if (r.yosh != null) { x.yoshSum += r.yosh * r.soni; x.yoshN += r.soni; }
    });
    return Object.values(m)
      .map((x) => ({ ...x, turi: turiMap[String(x.shifr)] || null, ortachaYosh: x.yoshN ? x.yoshSum / x.yoshN : 0 }))
      .sort((a, b) => b.jami - a.jami);
  }, [dokStat, turiMap]);
  // Jadval qatorlari — barqaror havola (DataTable rows o'zgarganda 1-sahifaga qaytadi, har renderda emas)
  const ixtisosQatorlari = useMemo(() => ixtisosliklar.map((x) => ({ ...x, id: `${x.shifr}|${x.nom}` })), [ixtisosliklar]);

  const top12 = useMemo(() => {
    const bosh = ixtisosliklar.slice(0, 12).map((x) => ({ ...x, yorliq: x.nom }));
    const qolgan = ixtisosliklar.slice(12);
    if (qolgan.length) {
      bosh.push({
        yorliq: `Boshqalar (${qolgan.length} ta ixtisoslik)`, boshqa: true,
        PhD: qolgan.reduce((a, x) => a + x.PhD, 0), DSc: qolgan.reduce((a, x) => a + x.DSc, 0), Stajyor: qolgan.reduce((a, x) => a + x.Stajyor, 0),
      });
    }
    return bosh;
  }, [ixtisosliklar]);

  const turiKesimi = useMemo(() => {
    const m = {};
    ixtisosliklar.forEach((x) => {
      const k = x.turi ? TURI_NOMI[x.turi] || x.turi : 'Boshqa';
      m[k] = (m[k] || 0) + x.jami;
    });
    return Object.entries(m).map(([nom, soni]) => ({ nom, soni, boshqa: nom === 'Boshqa' })).sort((a, b) => (a.boshqa ? 1 : b.boshqa ? -1 : b.soni - a.soni));
  }, [ixtisosliklar]);

  // ---- Hudud ----
  const hudud = useMemo(() => {
    const m = {}; let nomalum = 0;
    dokStat.forEach((r) => { if (r.hudud) m[r.hudud] = (m[r.hudud] || 0) + r.soni; else nomalum += r.soni; });
    const malum = Object.entries(m).map(([nom, soni]) => ({ nom, soni })).sort((a, b) => b.soni - a.soni);
    return { malum, nomalum, malumJami: malum.reduce((a, r) => a + r.soni, 0), qatorlar: nomalum ? [...malum, { nom: 'Ko‘rsatilmagan', soni: nomalum, boshqa: true }] : malum };
  }, [dokStat]);

  // ---- Ilmiy rahbarlar ----
  const rahbarlar = useMemo(() => {
    const m = {};
    rahbarStat.forEach((r) => {
      const x = (m[r.rahbar] ||= { rahbar: r.rahbar, PhD: 0, DSc: 0, Stajyor: 0, jami: 0 });
      x[r.daraja] = (x[r.daraja] || 0) + r.soni; x.jami += r.soni;
    });
    const royxat = Object.values(m).sort((a, b) => b.jami - a.jami);
    const yuk = { 1: 0, 2: 0, 3: 0, 4: 0 };
    royxat.forEach((x) => { yuk[Math.min(4, x.jami)] += 1; });
    const biriktirilgan = royxat.reduce((a, x) => a + x.jami, 0);
    return {
      soni: royxat.length, top15: royxat.slice(0, 15), biriktirilgan,
      ortacha: royxat.length ? biriktirilgan / royxat.length : 0,
      yuk: [{ nom: '1 doktorant', soni: yuk[1] }, { nom: '2 doktorant', soni: yuk[2] }, { nom: '3 doktorant', soni: yuk[3] }, { nom: '4 va undan ko‘p', soni: yuk[4] }],
    };
  }, [rahbarStat]);

  // ---- Ranglar ----
  const RAMP_QABUL = useMemo(() => ramp(5).slice(1).reverse(), []); // eng to'q — eng so'nggi yil
  const RAMP_KURS = useMemo(() => ramp(4).slice(1), []);
  const RAMP_YOSH = useMemo(() => ramp(6).slice(1), []);
  const RAMP_YUK = useMemo(() => ramp(5).slice(1), []);

  const H_D = Math.max(180, top12.length * 26 + 70);
  const H_E = Math.max(180, turiKesimi.length * 26 + 70);
  const H_G = Math.max(180, hudud.qatorlar.length * 26 + 70);
  const H_I = Math.max(180, rahbarlar.top15.length * 26 + 70) + 30;

  const jadvalUstunlar = [
    { key: 'shifr', label: 'Shifr', mono: true },
    { key: 'nom', label: 'Ixtisoslik' },
    { key: 'turi', label: 'Yo‘nalish guruhi', render: (r) => <Badge tone="info">{r.turi ? TURI_NOMI[r.turi] || r.turi : 'Boshqa'}</Badge> },
    { key: 'PhD', label: 'PhD', numeric: true, render: (r) => fmt(r.PhD) },
    { key: 'DSc', label: 'DSc', numeric: true, render: (r) => fmt(r.DSc) },
    { key: 'Stajyor', label: 'Stajyor', numeric: true, render: (r) => fmt(r.Stajyor) },
    { key: 'jami', label: 'Jami', numeric: true, render: (r) => fmt(r.jami) },
    { key: 'ayol', label: 'Ayollar', numeric: true, render: (r) => (r.jinsMalum ? `${fmt(r.ayol)} (${foizMatn(r.ayol, r.jinsMalum)})` : '—') },
    { key: 'ortachaYosh', label: 'O‘rtacha yosh', numeric: true, render: (r) => yoshMatn(r.ortachaYosh) },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* ---- 1. KPI + donutlar ---- */}
      <Card title="Toshkent davlat tibbiyot universiteti — doktorantura kontingenti" subtitle={`${MANBA} · 2024–2026 qabul`} extra={yuklandi ? `${fmt(jami)} doktorant` : undefined}>
        {/* Asosiy 4 ko'rsatkich — plitkalar; yosh, rahbarlar, hudud va login KPI chizig'ida */}
        <div className="grid stat-grid" style={{ marginBottom: 18 }}>
          <StatCard
            label="Doktorantlar"
            value={yuklandi ? fmt(jami) : '—'}
            icon="users"
            tone="primary"
            caption={jinsMalum ? `${foizMatn(jins.ayol, jinsMalum)} ayollar — jinsi ma‘lum bo‘lganlar` : undefined}
          />
          <StatCard label="PhD · DSc · stajyor" value={yuklandi ? `${fmt(daraja.PhD)} · ${fmt(daraja.DSc)} · ${fmt(daraja.Stajyor)}` : '—'} icon="certificate" tone="success" caption="daraja bo‘yicha" />
          <StatCard label="Ixtisosliklar" value={yuklandi ? fmt(new Set(ixtisosliklar.map((x) => x.shifr)).size) : '—'} icon="registry" tone="warning" caption="OAK shifri bo‘yicha" />
          <StatCard label={`${YIL}-yil qabuli`} value={yuklandi ? fmt(qabul[0].soni) : '—'} icon="clipboard" tone="primary" caption="qabul yili bo‘yicha" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <KpiStrip
            items={[
              { key: 'yosh', label: 'O‘rtacha yosh', value: yuklandi ? yoshMatn(yosh.ortacha) : '—', caption: `${YIL} holatiga` },
              { key: 'rahbar', label: 'Ilmiy rahbarlar', value: rahbarlar.soni ? fmt(rahbarlar.soni) : '—', caption: rahbarlar.soni ? `o‘rtacha ${yoshMatn(rahbarlar.ortacha)} doktorant` : undefined },
              { key: 'hudud', label: 'Hudud ma‘lum', value: yuklandi ? `${fmt(hudud.malumJami)} / ${fmt(jami)}` : '—', caption: yuklandi ? `${fmt(hudud.nomalum)} nafarda ko‘rsatilmagan` : undefined },
              { key: 'login', label: 'Login va parol berilgan', value: yuklandi ? fmt(jami) : '—' },
            ]}
          />
        </div>

        <div className="grid cols-3" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="4 bosqich">Ta‘lim bosqichi — doktorantlar qaysi dasturda?</GrafikSarlavha>
            <Donut rows={bosqichKesimi.map((r, i) => ({ ...r, rang: chartColors[i] }))} jami={jami} izoh="doktorant" ranglar={chartColors} />
            <ManbaIzoh>Tayanch va maqsadli tayanch doktorantura — PhD; doktorantura — DSc.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="jinsi ma‘lum bo‘lganlar bo‘yicha">Jins — ayollar va erkaklar nisbati</GrafikSarlavha>
            <Donut
              rows={[
                { nom: 'Ayollar', soni: jins.ayol, rang: chartColors[0] },
                { nom: 'Erkaklar', soni: jins.erkak, rang: chartColors[1] },
                { nom: 'Ko‘rsatilmagan', soni: jins.nomalum, rang: chartGray },
              ]}
              jami={jami}
              izoh="doktorant"
              ranglar={chartColors}
            />
            <ManbaIzoh>Manbada {fmt(jins.nomalum)} nafarning jinsi ko‘rsatilmagan — ulush {fmt(jinsMalum)} nafar bo‘yicha.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="tartibli — to‘q rang eng so‘nggi yil">Qabul yili — kontingent qaysi yillarda qabul qilingan?</GrafikSarlavha>
            <Donut rows={qabul.map((r, i) => ({ ...r, rang: RAMP_QABUL[i] }))} jami={jami} izoh="doktorant" ranglar={RAMP_QABUL} />
            <ManbaIzoh>2022–2023 yillar bittadan doktorant — bitta bo‘lakka yig‘ilgan.</ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* ---- 2. Ixtisosliklar va yo'nalish guruhlari ---- */}
      <Card title="Ixtisosliklar va yo‘nalish guruhlari" subtitle={`OAK shifrlari · ETTP klassifikatori bo‘yicha guruhlar · ${MANBA}`} extra={`${fmt(ixtisosliklar.length)} ixtisoslik`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="PhD · DSc · stajyor">Ixtisosliklar — eng ko‘p doktorantli 12 tasi</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={H_D}>
              <BarChart data={top12} layout="vertical" margin={{ top: 4, right: 16, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="yorliq" type="category" width={170} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(30)} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="PhD" name="PhD" stackId="d" barSize={13} isAnimationActive={false}>
                  {top12.map((r) => <Cell key={r.yorliq} fill={r.boshqa ? chartGray : chartColors[0]} />)}
                </Bar>
                <Bar dataKey="DSc" name="DSc" stackId="d" barSize={13} isAnimationActive={false}>
                  {top12.map((r) => <Cell key={r.yorliq} fill={r.boshqa ? chartGray : chartColors[1]} />)}
                </Bar>
                <Bar dataKey="Stajyor" name="Stajyor-tadqiqotchi" stackId="d" radius={RADIUS_H} barSize={13} isAnimationActive={false}>
                  {top12.map((r) => <Cell key={r.yorliq} fill={r.boshqa ? chartGray : chartColors[2]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>{MANBA}. Qolgan ixtisosliklar «Boshqalar» qatoriga yig‘ilgan.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="ETTP klassifikatori bo‘yicha">Yo‘nalish guruhlari — doktorantlar qaysi sohalarda?</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={H_E}>
              <BarChart data={turiKesimi} layout="vertical" margin={{ top: 4, right: 48, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="nom" type="category" width={170} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(30)} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Bar dataKey="soni" name="Doktorantlar" radius={RADIUS_H} barSize={BAR_MAX} isAnimationActive={false}>
                  {turiKesimi.map((r) => <Cell key={r.nom} fill={r.boshqa ? chartGray : chartColors[0]} />)}
                  <LabelList dataKey="soni" position="right" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>Guruh — ixtisoslik shifrining ETTP klassifikatoridagi turi (terapevtik, jarrohlik, pediatriya…).</ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* ---- 3. Yosh, hudud, kurs ---- */}
      <Card title="Yosh, hudud va kurs" subtitle={`doktorantlar tarkibi · ${MANBA}`} extra={`o‘rtacha yosh ${yoshMatn(yosh.ortacha)} · hudud ma‘lum ${fmt(hudud.malumJami)} nafar`}>
        <div className="grid cols-3" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="yosh guruhlari">Yosh tarkibi — doktorantlar necha yoshda?</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yosh.qatorlar} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="bin" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Bar dataKey="soni" name="Doktorantlar" radius={RADIUS_V} barSize={BAR_MAX} isAnimationActive={false}>
                  {yosh.qatorlar.map((r, i) => <Cell key={r.bin} fill={RAMP_YOSH[i]} />)}
                  <LabelList dataKey="soni" position="top" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>O‘rtacha yosh {yoshMatn(yosh.ortacha)} ({YIL} holatiga){jami - yosh.n > 0 ? `; ${fmt(jami - yosh.n)} nafarning yoshi ko‘rsatilmagan` : ''}.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="viloyat kesimida">Hududlar — doktorantlar qayerdan?</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={H_G}>
              <BarChart data={hudud.qatorlar} layout="vertical" margin={{ top: 4, right: 40, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="nom" type="category" width={120} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Bar dataKey="soni" name="Doktorantlar" radius={RADIUS_H} barSize={14} isAnimationActive={false}>
                  {hudud.qatorlar.map((r) => <Cell key={r.nom} fill={r.boshqa ? chartGray : chartColors[0]} />)}
                  <LabelList dataKey="soni" position="right" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>{fmt(hudud.nomalum)} nafarda hudud ko‘rsatilmagan; hudud manbadagi tuman/shahar yozuvidan aniqlangan.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="tartibli">Kurs — doktorantlar qaysi kursda?</GrafikSarlavha>
            <Donut rows={kursKesimi.map((r, i) => ({ ...r, rang: RAMP_KURS[i] }))} jami={jami} izoh="doktorant" ranglar={RAMP_KURS} />
            <ManbaIzoh>{YIL}/27 o‘quv yili boshidagi kurs.</ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* ---- 4. Ilmiy rahbarlar ---- */}
      <Card title="Ilmiy rahbarlar yuki" subtitle={`biriktirilgan doktorantlar soni bo‘yicha · ${MANBA}`} extra={`${fmt(rahbarlar.soni)} rahbar · o‘rtacha ${yoshMatn(rahbarlar.ortacha)} doktorant`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="PhD · DSc · stajyor">Eng ko‘p doktorant biriktirilgan rahbarlar — top-15</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={H_I}>
              <BarChart data={rahbarlar.top15} layout="vertical" margin={{ top: 4, right: 16, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="rahbar" type="category" width={190} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(32)} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="PhD" name="PhD" stackId="r" fill={chartColors[0]} barSize={13} isAnimationActive={false} />
                <Bar dataKey="DSc" name="DSc" stackId="r" fill={chartColors[1]} barSize={13} isAnimationActive={false} />
                <Bar dataKey="Stajyor" name="Stajyor-tadqiqotchi" stackId="r" fill={chartColors[2]} radius={RADIUS_H} barSize={13} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>{fmt(rahbarlar.soni)} rahbar · o‘rtacha {yoshMatn(rahbarlar.ortacha)} doktorant · jami {fmt(rahbarlar.biriktirilgan)} biriktirilgan.</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh="tartibli — nechta doktorant biriktirilgan">Rahbar yuki taqsimoti — rahbarlarning necha foizi nechta doktorant yuritadi?</GrafikSarlavha>
            <Donut rows={rahbarlar.yuk.map((r, i) => ({ ...r, rang: RAMP_YUK[i] }))} jami={rahbarlar.soni} izoh="rahbar" ranglar={RAMP_YUK} />
            <ManbaIzoh>Bir doktorantga bir rahbar; rahbar ko‘rsatilmagan yozuvlar hisobga kirmaydi.</ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* ---- 5. Ixtisosliklar ro'yxati ---- */}
      <Card title="Ixtisosliklar ro‘yxati" subtitle="bir qator — bir OAK ixtisosligi · daraja, jins va o‘rtacha yosh kesimida" extra={`${fmt(ixtisosliklar.length)} ixtisoslik`}>
        <DataTable
          searchable
          numbered
          columns={jadvalUstunlar}
          rows={ixtisosQatorlari}
          empty="Ixtisoslik ma‘lumotlari topilmadi"
          pageSize={25}
          footnote={`Manba: ${MANBA}. Ayollar ulushi — jinsi ma‘lum doktorantlarga nisbatan; «—» — jinsi ko‘rsatilmagan.`}
        />
      </Card>
    </div>
  );
}
