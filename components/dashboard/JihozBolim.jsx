'use client';

// Tibbiy jihozlar bo'limi — vazirlik dashboardi «Tibbiy jihozlar» tabi.
// Manba: docs/equipment_summary.xlsx — 3 875 muassasa × (jami, soz, nosoz, yaroqsiz), 210 tuman/shahar, 14 hudud
// (+ «Ko‘rsatilmagan» — hududi yozilmagan 105 yozuv; jamiga kiradi, hudud kesimiga kirmaydi).
// Qoidalar (dataviz + uttp-design-system): holat seriyalari (soz/nosoz/yaroqsiz) — STATUS ranglari
// (theme.success/warning/danger), chunki seriya ma'nosi «yaxshi/yomon»; nominal kategoriya (hudud, tuman,
// muassasa, tur) → chartColors[0]; tartibli binlar → ramp(); tooltip faqat chartTip; animatsiya yo'q; pie yo'q.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, ReferenceLine, CartesianGrid,
} from 'recharts';
import UzMap from '../UzMap';
import { Card, StatCard, KpiStrip, Badge, DataTable } from '../ui.jsx';
import {
  chartColors, fmt, foiz, axisStyle, cursorFill, gridStroke, BAR_MAX, RADIUS_H, RADIUS_V, ramp, qisqart,
  GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';
import { HUDUD_ID, hududIdsi, JIHOZ_KORSATILMAGAN } from '../../lib/hududlar';

const MANBA = 'Manba: tibbiy jihozlar yig‘masi (equipment_summary), 2026 · muassasa kesimida.';

// Holat seriyalari — status ranglari, tartib qat'iy (soz → nosoz → yaroqsiz)
const HOLAT = [
  { key: 'soz', nom: 'Soz', rang: theme.success },
  { key: 'nosoz', nom: 'Nosoz', rang: theme.warning },
  { key: 'yaroqsiz', nom: 'Yaroqsiz', rang: theme.danger },
];

// Bir xonali kasr: 82.1 → «82,1» (ru-RU — loyihadagi fmt bilan bir xil ajratgich)
const fmt1 = (n) => (Number(n) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const foizMatn = (v) => `${fmt1(v)} %`;

// Gorizontal bar balandligi — o'q bandi bilan birga (qator × 26 + 70, kamida 180)
const balandlik = (n) => Math.max(180, n * 26 + 70);
const LEGEND_JOY = 30;
const labelStyle = { fontSize: 11, fill: theme.muted };
const legendStyle = { fontSize: 12.5 };
const MARGIN = { top: 4, right: 48, left: 8 }; // o'ngda LabelList uchun joy
const MARGIN_CHIZIQ = { top: 16, right: 60, left: 8 }; // ReferenceLine yorlig'i uchun yuqorida joy

// Tooltip: qator ma'lumotini olish (Recharts 3: formatter(value, name, item) — item.payload = qator)
const qator = (item) => (item && item.payload) || {};

// Y o'qi uchun BIR QATORLI tick: Recharts 3 uzun matnni so'z bo'yicha o'raydi (ikki qator, qatorlar ustma-ust) —
// uzun muassasa/tur nomlari qisqartirib bitta qatorda chiziladi, to'liq nom tooltip'da.
const tekTick = (max) => {
  function TekTick({ x, y, payload }) {
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill={theme.muted}>
        {qisqart(max)(String(payload.value))}
      </text>
    );
  }
  return TekTick;
};
const TUR_TICK = tekTick(30);
const NOM_TICK = tekTick(36); // bosh harfli nomlar kengroq — 36 belgi 280px ga sig'adi

// Muassasalar taqsimoti — jihozlar soni bo'yicha tartibli binlar
const BINLAR = [
  { nom: '1–5', dan: 1, gacha: 5 },
  { nom: '6–20', dan: 6, gacha: 20 },
  { nom: '21–50', dan: 21, gacha: 50 },
  { nom: '51–100', dan: 51, gacha: 100 },
  { nom: '101–300', dan: 101, gacha: 300 },
  { nom: '301–1 000', dan: 301, gacha: 1000 },
  { nom: '1 000+', dan: 1001, gacha: Infinity },
];
// Yaroqsizlik reytingiga kiritish uchun tumandagi minimal jihozlar soni (kichik maxraj shovqini bo'lmasin)
const TUMAN_MIN_JIHOZ = 200;
const TOP_N = 15;

// Yig'indi: { muassasa, jami, soz, nosoz, yaroqsiz }
const yigindi = (rows) =>
  rows.reduce(
    (a, r) => {
      a.muassasa += r.muassasa || 0;
      a.jami += r.jami || 0;
      a.soz += r.soz || 0;
      a.nosoz += r.nosoz || 0;
      a.yaroqsiz += r.yaroqsiz || 0;
      return a;
    },
    { muassasa: 0, jami: 0, soz: 0, nosoz: 0, yaroqsiz: 0 }
  );

// Holat ulushlari va bir muassasaga o'rtacha (jadval qatorlari uchun)
const boyit = (r) => ({
  ...r,
  soz_ulush: foiz(r.soz, r.jami),
  nosoz_ulush: foiz(r.nosoz, r.jami),
  yaroqsiz_ulush: foiz(r.yaroqsiz, r.jami),
  ortacha: r.muassasa ? Math.round((r.jami / r.muassasa) * 10) / 10 : 0,
});

// Holat tooltip'i: «12 345 (82,1 %)»
const holatFormatter = (v, n, item) => [`${fmt(v)} (${foizMatn(foiz(v, qator(item).jami))})`, n];

// Jadval konteyneridan kengroq panel gorizontal scroll ortida qolib ketmasin — kengligi ko'rinadigan sohaga
// tenglashtiriladi (page.jsx HududBatafsil bilan bir xil usul)
function useJadvalEni() {
  const ref = useRef(null);
  const [en, setEn] = useState(null);
  useEffect(() => {
    const wrap = ref.current && ref.current.closest('.table-wrap');
    if (!wrap) return undefined;
    const olcha = () => setEn(wrap.clientWidth);
    olcha();
    const ro = new ResizeObserver(olcha);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);
  return [ref, en];
}

// Muassasalar ro'yxati ustunlari (tuman paneli va to'liq ro'yxat bir xil ko'rsatadi)
const MUASSASA_USTUNLAR = [
  { key: 'nomi', label: 'Muassasa', render: (m) => <div style={{ fontWeight: 600 }}>{m.nomi}</div> },
  { key: 'turi', label: 'Turi', render: (m) => <span style={{ color: 'var(--muted)' }}>{m.turi}</span> },
  { key: 'jami', label: 'Jihozlar', numeric: true, render: (m) => fmt(m.jami) },
  { key: 'soz', label: 'Soz', numeric: true, render: (m) => fmt(m.soz) },
  { key: 'nosoz', label: 'Nosoz', numeric: true, render: (m) => fmt(m.nosoz) },
  { key: 'yaroqsiz', label: 'Yaroqsiz', numeric: true, render: (m) => fmt(m.yaroqsiz) },
  { key: 'soz_ulush', label: 'Soz ulushi', numeric: true, render: (m) => foizMatn(m.soz_ulush) },
];

// ---- Tuman ichidagi muassasalar (tuman qatori ostida ochiladi) ----
function MuassasaBatafsil({ t, muassasalar }) {
  const [ref, en] = useJadvalEni();
  const royxat = useMemo(
    () =>
      (muassasalar || [])
        .filter((m) => m.hudud === t.hudud && m.tuman === t.tuman)
        .map((m) => ({ ...m, soz_ulush: foiz(m.soz, m.jami) }))
        .sort((a, b) => b.jami - a.jami),
    [muassasalar, t.hudud, t.tuman]
  );
  return (
    <div className="hudud-batafsil" ref={ref} style={en ? { width: en } : undefined}>
      <div className="hb-sarlavha">
        {t.tuman} — muassasalar kesimida
        <span className="hb-sarlavha-izoh">{fmt(royxat.length)} ta muassasa · {fmt(t.jami)} jihoz</span>
      </div>
      <DataTable
        numbered
        columns={MUASSASA_USTUNLAR}
        rows={royxat}
        empty="Bu tumanda muassasa topilmadi"
        pageSize={royxat.length > 30 ? 30 : undefined}
        footnote="Turi — muassasa nomi bo‘yicha tasniflangan (manbada tur ustuni yo‘q)."
      />
    </div>
  );
}

// ---- Hudud ichidagi tumanlar (hudud qatori ostida ochiladi; tuman qatori → muassasalar) ----
function TumanBatafsil({ r, tumanStat, muassasalar }) {
  const [ref, en] = useJadvalEni();
  const royxat = useMemo(
    () =>
      (tumanStat || [])
        .filter((t) => t.hudud === r.hudud)
        .map(boyit)
        .sort((a, b) => b.jami - a.jami),
    [tumanStat, r.hudud]
  );
  return (
    <div className="hudud-batafsil" ref={ref} style={en ? { width: en } : undefined}>
      <div className="hb-sarlavha">
        {r.hudud} — tuman va shaharlar kesimida
        <span className="hb-sarlavha-izoh">{royxat.length} ta tuman/shahar · qatorni bosing — muassasalar ochiladi</span>
      </div>
      <DataTable
        numbered
        columns={[
          { key: 'tuman', label: 'Tuman / shahar', rowHeader: true },
          { key: 'muassasa', label: 'Muassasalar', numeric: true, render: (t) => fmt(t.muassasa) },
          { key: 'jami', label: 'Jihozlar', numeric: true, render: (t) => fmt(t.jami) },
          { key: 'soz', label: 'Soz', numeric: true, render: (t) => fmt(t.soz) },
          { key: 'nosoz', label: 'Nosoz', numeric: true, render: (t) => fmt(t.nosoz) },
          { key: 'yaroqsiz', label: 'Yaroqsiz', numeric: true, render: (t) => fmt(t.yaroqsiz) },
          { key: 'soz_ulush', label: 'Soz ulushi', numeric: true, render: (t) => foizMatn(t.soz_ulush) },
          { key: 'ortacha', label: 'O‘rtacha / muassasa', numeric: true, render: (t) => fmt1(t.ortacha) },
        ]}
        rows={royxat}
        empty="Bu hududda tuman topilmadi"
        rowKey={(t) => `${t.hudud}|${t.tuman}`}
        renderExpanded={(t) => <MuassasaBatafsil t={t} muassasalar={muassasalar} />}
        footnote="Rus-kirill nomli tuman guruhlari lotin kanonik tumanga birlashtirilgan."
      />
    </div>
  );
}

export default function JihozBolim({ hududStat = [], tumanStat = [], turiStat = [], muassasalar = [] }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [ochiqHudud, setOchiqHudud] = useState(null);
  const jadvalRef = useRef(null);

  // ---- Asosiy yig'indilar ----
  // Hudud kesimi: «Ko‘rsatilmagan» guruhi chiqariladi (xarita/grafiklar), jamida qoladi (manba «Umumiy hisob» 272 578)
  const hududlar = useMemo(
    () => hududStat.filter((h) => h.hudud !== JIHOZ_KORSATILMAGAN).map(boyit).sort((a, b) => b.jami - a.jami),
    [hududStat]
  );
  const korsatilmagan = useMemo(() => hududStat.find((h) => h.hudud === JIHOZ_KORSATILMAGAN) || null, [hududStat]);
  const jami = useMemo(() => boyit(yigindi(hududStat)), [hududStat]);
  const hududJami = useMemo(() => boyit(yigindi(hududlar)), [hududlar]);
  const tumanSoni = useMemo(() => tumanStat.filter((t) => t.hudud !== JIHOZ_KORSATILMAGAN).length, [tumanStat]);
  const muammoli = jami.nosoz + jami.yaroqsiz;
  // Mediana — muassasalar jihozlar soni bo'yicha (o'rtacha yirik markazlar ta'sirida yuqori chiqadi)
  const mediana = useMemo(() => {
    if (!muassasalar.length) return 0;
    const s = muassasalar.map((m) => m.jami || 0).sort((a, b) => a - b);
    const o = Math.floor(s.length / 2);
    return s.length % 2 ? s[o] : Math.round((s[o - 1] + s[o]) / 2);
  }, [muassasalar]);

  // ---- Xarita va hudud reytingi (Umumiy tab bilan bir xil naqsh) ----
  const hududReyting = useMemo(() => hududlar.map((h) => ({ ...h, id: hududIdsi(h.hudud) })), [hududlar]);
  const regionStats = useMemo(() => {
    const stats = {};
    hududReyting.forEach((r) => {
      if (r.id) stats[r.id] = r.jami;
    });
    return stats;
  }, [hududReyting]);
  const reytingdanTanla = (e) => {
    const id = hududIdsi(e && e.activeLabel);
    if (!id) return;
    setSelectedRegion(selectedRegion === id ? null : id);
  };

  // Grafikdan hudud bosilganda pastdagi jadvalda o'sha hudud paneli ochiladi
  const hududniOch = (e) => {
    const hudud = e && e.activeLabel;
    if (!hudud) return;
    setOchiqHudud(hudud);
    if (jadvalRef.current) jadvalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- A. Holat — hudud kesimida ----
  const sozUlush = useMemo(() => [...hududlar].sort((a, b) => b.soz_ulush - a.soz_ulush), [hududlar]);

  // ---- B. Tumanlar ----
  const tumanlar = useMemo(() => tumanStat.filter((t) => t.hudud !== JIHOZ_KORSATILMAGAN).map(boyit), [tumanStat]);
  const tumanTop = useMemo(() => [...tumanlar].sort((a, b) => b.jami - a.jami).slice(0, TOP_N), [tumanlar]);
  const tumanYaroqsiz = useMemo(
    () => tumanlar.filter((t) => t.jami >= TUMAN_MIN_JIHOZ).sort((a, b) => b.yaroqsiz_ulush - a.yaroqsiz_ulush).slice(0, TOP_N),
    [tumanlar]
  );
  const tumanKiritilgan = useMemo(() => tumanlar.filter((t) => t.jami >= TUMAN_MIN_JIHOZ).length, [tumanlar]);

  // ---- C. Muassasa turlari ----
  const turlar = useMemo(() => turiStat.map(boyit), [turiStat]);
  const turMuassasa = useMemo(() => [...turlar].sort((a, b) => b.muassasa - a.muassasa), [turlar]);
  const turJihoz = useMemo(() => [...turlar].sort((a, b) => b.jami - a.jami), [turlar]);
  const turJami = useMemo(() => boyit(yigindi(turlar)), [turlar]);

  // ---- D. Taqsimot va yirik muassasalar ----
  const binlar = useMemo(
    () =>
      BINLAR.map((b) => ({
        bin: b.nom,
        soni: muassasalar.filter((m) => (m.jami || 0) >= b.dan && (m.jami || 0) <= b.gacha).length,
      })),
    [muassasalar]
  );
  const binRang = useMemo(() => ramp(BINLAR.length + 1).slice(1), []);
  const top10 = useMemo(
    () =>
      [...muassasalar]
        .sort((a, b) => b.jami - a.jami)
        .slice(0, 10)
        .map((m) => ({ ...m, soz_ulush: foiz(m.soz, m.jami) })),
    [muassasalar]
  );

  // ---- E. Jadvallar ----
  const hududJadval = useMemo(
    () => (korsatilmagan ? [...hududlar, boyit(korsatilmagan)] : hududlar),
    [hududlar, korsatilmagan]
  );
  const muassasaJadval = useMemo(
    () => muassasalar.map((m) => ({ ...m, soz_ulush: foiz(m.soz, m.jami) })),
    [muassasalar]
  );

  const korsatilmaganIzoh = korsatilmagan
    ? ` ${fmt(korsatilmagan.jami)} ta jihoz (${fmt(korsatilmagan.muassasa)} yozuv) hududi ko‘rsatilmagan holda kiritilgan — jamiga kiradi, hudud kesimiga kirmaydi.`
    : '';

  return (
    <>
      {/* ---- 1. KPI + xarita + hudud reytingi ---- */}
      <Card
        title="Tibbiy jihozlar — respublika monitoringi (2026)"
        subtitle="tibbiy jihozlar yig‘masi · muassasa kesimida · holat: soz / nosoz / yaroqsiz"
        extra={`${hududlar.length} hudud`}
      >
        <div className="grid stat-grid" style={{ marginBottom: 18 }}>
          <StatCard label="Jami jihozlar" value={fmt(jami.jami)} icon="registry" tone="primary" caption={`${fmt(jami.muassasa)} muassasa · ${fmt(tumanSoni)} tuman/shahar`} />
          <StatCard label="Soz holatda" value={fmt(jami.soz)} icon="check" tone="success" caption={`${foizMatn(jami.soz_ulush)} jami jihozlardan`} />
          <StatCard label="Nosoz" value={fmt(jami.nosoz)} icon="alert" tone="warning" caption={`${foizMatn(jami.nosoz_ulush)} · ta‘mirtalab`} />
          <StatCard label="Yaroqsiz" value={fmt(jami.yaroqsiz)} icon="minus" tone="accent" caption={`${foizMatn(jami.yaroqsiz_ulush)} · hisobdan chiqarish/yangilash`} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <KpiStrip
            items={[
              { key: 'muammoli', label: 'Muammoli jihozlar (nosoz + yaroqsiz)', value: fmt(muammoli), caption: `${foizMatn(foiz(muammoli, jami.jami))} jami jihozlardan` },
              { key: 'ortacha', label: 'Bir muassasaga o‘rtacha', value: fmt1(jami.ortacha), caption: `mediana ${fmt(mediana)} ta jihoz` },
              { key: 'tuman', label: 'Tuman va shaharlar', value: fmt(tumanSoni), caption: `${hududlar.length} hudud kesimida` },
              {
                key: 'korsatilmagan',
                label: 'Hududi ko‘rsatilmagan yozuvlar',
                value: korsatilmagan ? fmt(korsatilmagan.jami) : '0',
                caption: korsatilmagan ? `${fmt(korsatilmagan.muassasa)} yozuv · hudud kesimiga kirmaydi` : 'barcha yozuvlar hududli',
              },
            ]}
          />
        </div>

        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <UzMap
            regionStats={regionStats}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            title="Hududlar bo‘yicha tibbiy jihozlar (xarita)"
            subtitle="Hududni bosing — o‘ngdagi reytingda ajratiladi"
            birlik="jihoz"
          />
          <Card
            title="Hududlar bo‘yicha tibbiy jihozlar"
            subtitle="jihozlar soni bo‘yicha tartiblangan · barni bosing — xaritada tanlanadi"
            extra={
              selectedRegion && HUDUD_ID[selectedRegion] ? (
                <Badge tone="info">{HUDUD_ID[selectedRegion]}</Badge>
              ) : (
                `${hududReyting.length} hudud`
              )
            }
          >
            <ResponsiveContainer width="100%" height={balandlik(hududReyting.length)}>
              <BarChart data={hududReyting} layout="vertical" margin={MARGIN} onClick={reytingdanTanla} style={{ cursor: 'pointer' }}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  formatter={(v, n, item) => [`${fmt(v)} · ${fmt(qator(item).muassasa)} muassasa`, n]}
                />
                <Bar dataKey="jami" name="Jihozlar" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                  {/* Nominal kategoriya — bitta rang; xaritada tanlov bo'lsa tanlangan hudud primary, qolganlari xira */}
                  {hududReyting.map((r) => (
                    <Cell
                      key={r.hudud}
                      fill={!selectedRegion ? chartColors[0] : r.id === selectedRegion ? 'var(--primary)' : 'var(--line-strong)'}
                    />
                  ))}
                  <LabelList dataKey="jami" position="right" formatter={fmt} style={labelStyle} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <ManbaIzoh>
          {MANBA}
          {korsatilmaganIzoh}
        </ManbaIzoh>
      </Card>

      {/* ---- 2. Holat — hudud kesimida ---- */}
      <div style={{ marginTop: 24 }}>
        <Card title="Jihozlar holati — hudud kesimida" subtitle="soz · nosoz · yaroqsiz · grafikdagi hududni bosing — quyidagi jadvalda paneli ochiladi" extra={`${hududlar.length} hudud`}>
          <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
            <div>
              <GrafikSarlavha izoh="jihozlar soni bo‘yicha tartiblangan">Jihozlar soni va holati</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(hududlar.length) + LEGEND_JOY}>
                <BarChart data={hududlar} layout="vertical" margin={MARGIN} onClick={hududniOch} style={{ cursor: 'pointer' }}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={holatFormatter} />
                  <Legend wrapperStyle={legendStyle} iconType="circle" itemSorter={null} />
                  {HOLAT.map((h, i) => (
                    <Bar
                      key={h.key}
                      dataKey={h.key}
                      name={h.nom}
                      stackId="h"
                      fill={h.rang}
                      radius={i === HOLAT.length - 1 ? RADIUS_H : undefined}
                      barSize={13}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <GrafikSarlavha izoh="soz ÷ jami">Soz holatdagi jihozlar ulushi</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(sozUlush.length) + LEGEND_JOY}>
                <BarChart data={sozUlush} layout="vertical" margin={MARGIN_CHIZIQ} onClick={hududniOch} style={{ cursor: 'pointer' }}>
                  <XAxis type="number" domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} %`} />
                  <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    formatter={(v, n, item) => {
                      const q = qator(item);
                      return [`${foizMatn(v)} (${fmt(q.soz)} / ${fmt(q.jami)})`, n];
                    }}
                  />
                  <Bar dataKey="soz_ulush" name="Soz ulushi" fill={theme.success} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                    <LabelList dataKey="soz_ulush" position="right" formatter={foizMatn} style={labelStyle} />
                  </Bar>
                  {hududJami.jami > 0 && (
                    <ReferenceLine
                      x={hududJami.soz_ulush}
                      stroke={theme.muted}
                      strokeWidth={1}
                      label={{ value: `Respublika ${foizMatn(hududJami.soz_ulush)}`, position: 'top', fontSize: 11, fill: theme.muted }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ManbaIzoh>
            {MANBA} Respublika ko‘rsatkichi — hudud qatorlari yig‘indisi (Σsoz ÷ Σjami), ulushlar o‘rtachasi emas.
            {korsatilmaganIzoh}
          </ManbaIzoh>
        </Card>
      </div>

      {/* ---- 3. Tumanlar kesimida ---- */}
      <div style={{ marginTop: 24 }}>
        <Card title="Tuman va shaharlar kesimida" subtitle="eng ko‘p jihozli hududiy birliklar va yaroqsizlik darajasi eng yuqori tumanlar" extra={`${fmt(tumanSoni)} tuman/shahar`}>
          <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
            <div>
              <GrafikSarlavha izoh={`eng ko‘p ${TOP_N} ta`}>Jihozlar soni — tuman / shahar</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(tumanTop.length)}>
                <BarChart data={tumanTop} layout="vertical" margin={MARGIN}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="tuman" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(22)} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    labelFormatter={(l, payload) => {
                      const q = qator(payload && payload[0]);
                      return q.hudud ? `${q.tuman} · ${q.hudud}` : l;
                    }}
                    formatter={(v, n, item) => [`${fmt(v)} · ${fmt(qator(item).muassasa)} muassasa`, n]}
                  />
                  <Bar dataKey="jami" name="Jihozlar" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                    <LabelList dataKey="jami" position="right" formatter={fmt} style={labelStyle} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <GrafikSarlavha izoh={`≥ ${TUMAN_MIN_JIHOZ} jihozli tumanlar orasida`}>Yaroqsiz jihozlar ulushi eng yuqori tumanlar</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(tumanYaroqsiz.length) + 12}>
                <BarChart data={tumanYaroqsiz} layout="vertical" margin={MARGIN_CHIZIQ}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} %`} />
                  <YAxis dataKey="tuman" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(22)} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    labelFormatter={(l, payload) => {
                      const q = qator(payload && payload[0]);
                      return q.hudud ? `${q.tuman} · ${q.hudud}` : l;
                    }}
                    formatter={(v, n, item) => {
                      const q = qator(item);
                      return [`${foizMatn(v)} (${fmt(q.yaroqsiz)} / ${fmt(q.jami)})`, n];
                    }}
                  />
                  <Bar dataKey="yaroqsiz_ulush" name="Yaroqsiz ulushi" fill={theme.danger} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                    <LabelList dataKey="yaroqsiz_ulush" position="right" formatter={foizMatn} style={labelStyle} />
                  </Bar>
                  {hududJami.jami > 0 && (
                    <ReferenceLine
                      x={hududJami.yaroqsiz_ulush}
                      stroke={theme.muted}
                      strokeWidth={1}
                      label={{ value: `Respublika ${foizMatn(hududJami.yaroqsiz_ulush)}`, position: 'top', fontSize: 11, fill: theme.muted }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ManbaIzoh>
            {MANBA} Yaroqsizlik reytingi — {fmt(TUMAN_MIN_JIHOZ)} va undan ko‘p jihozli {fmt(tumanKiritilgan)} ta tuman/shahar orasida
            (kichik maxraj shovqini bo‘lmasin). To‘liq ro‘yxat — quyidagi hudud jadvalida qator ochilganda.
          </ManbaIzoh>
        </Card>
      </div>

      {/* ---- 4. Muassasa turlari ---- */}
      <div style={{ marginTop: 24 }}>
        <Card title="Muassasa turlari kesimida" subtitle="nom bo‘yicha tasniflangan · muassasalar soni, jihozlar va holati" extra={`${turlar.length} tur`}>
          <div className="grid cols-2" style={{ gap: 24, alignItems: 'start', marginBottom: 24 }}>
            <div>
              <GrafikSarlavha izoh="muassasalar soni">Muassasalar — tur bo‘yicha</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(turMuassasa.length)}>
                <BarChart data={turMuassasa} layout="vertical" margin={MARGIN}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="turi" type="category" width={190} tick={TUR_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n, item) => [`${fmt(v)} · ${fmt(qator(item).jami)} jihoz`, n]} />
                  <Bar dataKey="muassasa" name="Muassasalar" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                    <LabelList dataKey="muassasa" position="right" formatter={fmt} style={labelStyle} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <GrafikSarlavha izoh="jihozlar soni bo‘yicha tartiblangan">Jihozlar holati — tur bo‘yicha</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={balandlik(turJihoz.length) + LEGEND_JOY}>
                <BarChart data={turJihoz} layout="vertical" margin={MARGIN}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="turi" type="category" width={190} tick={TUR_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={holatFormatter} />
                  <Legend wrapperStyle={legendStyle} iconType="circle" itemSorter={null} />
                  {HOLAT.map((h, i) => (
                    <Bar
                      key={h.key}
                      dataKey={h.key}
                      name={h.nom}
                      stackId="t"
                      fill={h.rang}
                      radius={i === HOLAT.length - 1 ? RADIUS_H : undefined}
                      barSize={13}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <DataTable
            columns={[
              { key: 'turi', label: 'Muassasa turi', rowHeader: true },
              { key: 'muassasa', label: 'Muassasalar', numeric: true, render: (t) => fmt(t.muassasa) },
              { key: 'jami', label: 'Jihozlar', numeric: true, render: (t) => fmt(t.jami) },
              { key: 'ortacha', label: 'O‘rtacha / muassasa', numeric: true, render: (t) => fmt1(t.ortacha) },
              { key: 'soz_ulush', label: 'Soz', numeric: true, render: (t) => foizMatn(t.soz_ulush) },
              { key: 'nosoz_ulush', label: 'Nosoz', numeric: true, render: (t) => foizMatn(t.nosoz_ulush) },
              { key: 'yaroqsiz_ulush', label: 'Yaroqsiz', numeric: true, render: (t) => foizMatn(t.yaroqsiz_ulush) },
            ]}
            rows={turJihoz}
            empty="Tur ma‘lumotlari topilmadi"
            rowKey={(t) => t.turi}
            totals={{
              turi: `${turlar.length} tur`,
              muassasa: fmt(turJami.muassasa),
              jami: fmt(turJami.jami),
              ortacha: fmt1(turJami.ortacha),
              soz_ulush: foizMatn(turJami.soz_ulush),
              nosoz_ulush: foizMatn(turJami.nosoz_ulush),
              yaroqsiz_ulush: foizMatn(turJami.yaroqsiz_ulush),
            }}
            footnote="Tur — muassasa nomidagi kalit so‘zlar bo‘yicha (manbada tur ustuni yo‘q); «Boshqa muassasalar» — bo‘lim va sinov yozuvlari kabi tasniflanmaganlar."
          />
        </Card>
      </div>

      {/* ---- 5. Taqsimot va yirik muassasalar ---- */}
      <div style={{ marginTop: 24 }}>
        <Card title="Muassasalar taqsimoti va eng yirik muassasalar" subtitle="jihozlar soni bo‘yicha muassasalar guruhlari · eng ko‘p jihozli 10 muassasa">
          <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
            <div>
              <GrafikSarlavha izoh="muassasalar soni">Nechta muassasada qancha jihoz bor?</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={binlar} margin={{ top: 20, right: 16, left: 8 }}>
                  <CartesianGrid stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="bin" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [`${fmt(v)} muassasa`, n]} labelFormatter={(l) => `${l} jihoz`} />
                  <Bar dataKey="soni" name="Muassasalar" radius={RADIUS_V} barSize={BAR_MAX} isAnimationActive={false}>
                    {/* Tartibli binlar (kam → ko'p) — sekvensial rampa, eng och qadam tashlanadi */}
                    {binlar.map((b, i) => (
                      <Cell key={b.bin} fill={binRang[i]} />
                    ))}
                    <LabelList dataKey="soni" position="top" formatter={fmt} style={labelStyle} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ManbaIzoh>
                Mediana — {fmt(mediana)} ta jihoz: muassasalarning yarmida shundan kam jihoz bor; o‘rtacha ({fmt1(jami.ortacha)}) yirik markazlar hisobiga yuqori.
              </ManbaIzoh>
            </div>
            <div>
              <GrafikSarlavha izoh="jihozlar soni">Eng ko‘p jihozli 10 muassasa</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={Math.max(180, top10.length * 30 + 70)}>
                <BarChart data={top10} layout="vertical" margin={MARGIN}>
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="nomi" type="category" width={280} tick={NOM_TICK} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    labelFormatter={(l, payload) => {
                      const q = qator(payload && payload[0]);
                      return q.nomi ? `${q.nomi} · ${q.tuman}` : l;
                    }}
                    formatter={(v, n, item) => [`${fmt(v)} · soz ${foizMatn(qator(item).soz_ulush)}`, n]}
                  />
                  <Bar dataKey="jami" name="Jihozlar" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                    <LabelList dataKey="jami" position="right" formatter={fmt} style={labelStyle} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ManbaIzoh>To‘liq nom va tuman — kursorni bar ustiga olib boring; ro‘yxat quyidagi jadvalda qidiruv bilan.</ManbaIzoh>
            </div>
          </div>
        </Card>
      </div>

      {/* ---- 6. Hudud kesimida to'liq jadval (hudud → tuman → muassasa) ---- */}
      <div style={{ marginTop: 24 }} ref={jadvalRef}>
        <Card title="Hudud kesimida to‘liq ko‘rsatkichlar" subtitle="qatorni bosing — tumanlar ochiladi, tuman qatori — muassasalar" extra={`${hududJadval.length} qator`}>
          <DataTable
            searchable
            numbered
            columns={[
              {
                key: 'hudud',
                label: 'Hudud',
                rowHeader: true,
                render: (r) => (r.hudud === JIHOZ_KORSATILMAGAN ? <Badge tone="neutral">{r.hudud}</Badge> : r.hudud),
              },
              { key: 'tuman_soni', label: 'Tumanlar', numeric: true, render: (r) => fmt(r.tuman_soni) },
              { key: 'muassasa', label: 'Muassasalar', numeric: true, render: (r) => fmt(r.muassasa) },
              { key: 'jami', label: 'Jihozlar', numeric: true, render: (r) => fmt(r.jami) },
              { key: 'soz', label: 'Soz', numeric: true, render: (r) => fmt(r.soz) },
              { key: 'nosoz', label: 'Nosoz', numeric: true, render: (r) => fmt(r.nosoz) },
              { key: 'yaroqsiz', label: 'Yaroqsiz', numeric: true, render: (r) => fmt(r.yaroqsiz) },
              { key: 'soz_ulush', label: 'Soz ulushi', numeric: true, render: (r) => foizMatn(r.soz_ulush) },
              { key: 'yaroqsiz_ulush', label: 'Yaroqsiz ulushi', numeric: true, render: (r) => foizMatn(r.yaroqsiz_ulush) },
              { key: 'ortacha', label: 'O‘rtacha / muassasa', numeric: true, render: (r) => fmt1(r.ortacha) },
            ]}
            rows={hududJadval}
            empty="Hudud ma‘lumotlari topilmadi"
            rowKey={(r) => r.hudud}
            renderExpanded={(r) => <TumanBatafsil r={r} tumanStat={tumanStat} muassasalar={muassasalar} />}
            expandedKey={ochiqHudud}
            onExpandedChange={setOchiqHudud}
            totals={{
              hudud: `${hududlar.length} hudud${korsatilmagan ? ' + ko‘rsatilmagan' : ''}`,
              tuman_soni: fmt(tumanSoni),
              muassasa: fmt(jami.muassasa),
              jami: fmt(jami.jami),
              soz: fmt(jami.soz),
              nosoz: fmt(jami.nosoz),
              yaroqsiz: fmt(jami.yaroqsiz),
              soz_ulush: foizMatn(jami.soz_ulush),
              yaroqsiz_ulush: foizMatn(jami.yaroqsiz_ulush),
              ortacha: fmt1(jami.ortacha),
            }}
            footnote={`${MANBA} Jami — manbadagi «Umumiy hisob» bilan bir xil (hududi ko‘rsatilmagan yozuvlar ham kiradi).`}
          />
        </Card>
      </div>

      {/* ---- 7. Muassasalar ro'yxati (qidiruv bilan) ---- */}
      <div style={{ marginTop: 24 }}>
        <Card title="Muassasalar ro‘yxati" subtitle="nom, hudud, tuman yoki tur bo‘yicha qidiring · ustun sarlavhasini bosing — tartiblash" extra={`${fmt(muassasaJadval.length)} muassasa`}>
          <DataTable
            searchable
            numbered
            pageSize={25}
            columns={[
              { key: 'nomi', label: 'Muassasa', render: (m) => <div style={{ fontWeight: 600 }}>{m.nomi}</div> },
              { key: 'hudud', label: 'Hudud', render: (m) => (m.hudud === JIHOZ_KORSATILMAGAN ? <Badge tone="neutral">{m.hudud}</Badge> : m.hudud) },
              { key: 'tuman', label: 'Tuman / shahar', render: (m) => (m.tuman === JIHOZ_KORSATILMAGAN ? '—' : m.tuman) },
              { key: 'turi', label: 'Turi', render: (m) => <span style={{ color: 'var(--muted)' }}>{m.turi}</span> },
              { key: 'jami', label: 'Jihozlar', numeric: true, render: (m) => fmt(m.jami) },
              { key: 'soz', label: 'Soz', numeric: true, render: (m) => fmt(m.soz) },
              { key: 'nosoz', label: 'Nosoz', numeric: true, render: (m) => fmt(m.nosoz) },
              { key: 'yaroqsiz', label: 'Yaroqsiz', numeric: true, render: (m) => fmt(m.yaroqsiz) },
              { key: 'soz_ulush', label: 'Soz ulushi', numeric: true, render: (m) => foizMatn(m.soz_ulush) },
            ]}
            rows={muassasaJadval}
            empty="Muassasa topilmadi"
            rowKey={(m) => m.id}
            footnote="Muassasa nomlari manbadagidek (imlo farqlari saqlangan); tur — nom bo‘yicha tasniflangan."
          />
        </Card>
      </div>
    </>
  );
}
