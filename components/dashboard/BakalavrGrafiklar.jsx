'use client';

// Bakalavriat bo'limi — qo'shimcha grafiklar (KPI/grafik kartasi va fakultet jadvali orasiga qo'yiladi).
//  A/B/C — ta'lim turlari bo'yicha eng ko'p talabali mutaxassisliklar (qolgani «Boshqalar»),
//  D — bakalavr kontingenti kurs × jins kesimida (guruhlangan ustunlar),
//  F — fakultetlar bo'yicha jins ulushi (100 % stack, bakalavriat o'rtachasi chizig'i bilan),
//  E — fakultet × kurs issiqlik xaritasi (HTML grid, sekvensial turquoise rampa) — to'liq kenglikda,
//      quyidagi fakultet jadvalining vizual xulosasi sifatida uning tepasida turadi.
// Ranglar: nominal ro'yxat + bitta o'lchov → bitta rang (chartColors[0]), «Boshqalar» — chartGray;
// jins bo'yicha Ayollar [0], Erkaklar [1] (shu tabdagi mavjud grafikka mos).
import { Fragment, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Card } from '../ui.jsx';
import {
  chartColors, chartGray, fmt, foiz, axisStyle, gridStroke, cursorFill, RADIUS_H, RADIUS_V, ramp, qisqart,
  GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';

const MANBA = 'TDTU ro‘yxati · 03.09.2026';
const KURSLAR = [1, 2, 3, 4, 5, 6];
const RAMPA = ramp(7); // issiqlik xaritasi: 7 qadam, och → to'q
const BOSH_KATAK = 'var(--bg)'; // 0 qiymatli katak — neytral fon tokeni, rampaga kirmaydi
const SON_KALIT = { ayolFoiz: 'ayol', erkakFoiz: 'erkak' }; // F: foiz kaliti → nafar kaliti

// Foiz matni bir xona bilan: 58.1 → «58,1 %»
const foizMatn = (v) =>
  `${Number(v || 0).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

// Gorizontal bar konteyner balandligi — qatorlar × 26 + o'q tasmasi (kamida 180)
const barBalandlik = (n) => Math.max(180, n * 26 + 70);

// Ta'lim turi bo'yicha mutaxassisliklarni yig'ib (bir mutaxassislik bir nechta fakultetda
// uchraydi), eng ko'p talabali n tasini qoldiradi; qolgani «Boshqalar» qatoriga yig'iladi.
// Teng qiymatlar nom bo'yicha tartiblanadi — chegaradagi tanlov barqaror bo'lsin.
function topMutaxassislik(mutStat, talimTuri, n) {
  const m = new Map();
  mutStat.forEach((r) => {
    if (r.talim_turi !== talimTuri) return;
    m.set(r.mutaxassislik, (m.get(r.mutaxassislik) || 0) + (r.soni || 0));
  });
  const royxat = [...m]
    .map(([mutaxassislik, soni]) => ({ mutaxassislik, soni }))
    .sort((a, b) => b.soni - a.soni || String(a.mutaxassislik).localeCompare(String(b.mutaxassislik)));
  const qatorlar = royxat.slice(0, n);
  const qolgan = royxat.slice(n);
  if (qolgan.length) {
    qatorlar.push({ mutaxassislik: 'Boshqalar', soni: qolgan.reduce((a, r) => a + r.soni, 0), boshqa: true });
  }
  return {
    qatorlar,
    jami: royxat.reduce((a, r) => a + r.soni, 0),
    mutSoni: royxat.length,
    qolganSoni: qolgan.length,
  };
}

// A/B/C — bitta o'lchov, bitta rang (chartColors[0]); «Boshqalar» kulrang (Cell orqali), uchida qiymat yorlig'i
function MutaxassislikBar({ qatorlar }) {
  return (
    <ResponsiveContainer width="100%" height={barBalandlik(qatorlar.length)}>
      <BarChart data={qatorlar} layout="vertical" margin={{ top: 4, right: 48, left: 8 }}>
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
        <YAxis
          dataKey="mutaxassislik"
          type="category"
          width={150}
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={qisqart(26)}
        />
        <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
        <Bar dataKey="soni" name="Talabalar" fill={chartColors[0]} radius={RADIUS_H} barSize={14} isAnimationActive={false}>
          {qatorlar.map((r) => (
            <Cell key={r.mutaxassislik} fill={r.boshqa ? chartGray : chartColors[0]} />
          ))}
          <LabelList dataKey="soni" position="right" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// A/B/C ostidagi izoh — «Boshqalar» nimadan yig'ilganini aytadi
function MutaxassislikIzoh({ t }) {
  if (!t.mutSoni) return null;
  return (
    <ManbaIzoh>
      Jami {t.mutSoni} ta mutaxassislik, {fmt(t.jami)} talaba
      {t.qolganSoni > 0 && ` · «Boshqalar» — qolgan ${t.qolganSoni} ta mutaxassislik yig‘indisi`}
    </ManbaIzoh>
  );
}

// E — fakultet × kurs issiqlik xaritasi (HTML grid, to'liq kenglikdagi kartada). Katak rangi maksimal
// katakka nisbatan 7 ta teng bin'ga bo'linadi; 0 — neytral katak («—»). Eng to'q 2 qadamda matn oq
// (4-qadamda oq matn kontrasti 4,5:1 dan past bo'lgani uchun u yerda matn qora qoladi).
function IssiqlikXaritasi({ qatorlar, max }) {
  const bin = (v) => Math.min(6, Math.floor((v / max) * 7));
  return (
    <div>
      {/* overflowX — faqat tor ekran uchun ehtiyot chorasi; ish stoli kengligida grid to'liq sig'adi */}
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px repeat(6, minmax(56px, 1fr)) 84px',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <div />
          {KURSLAR.map((k) => (
            <div key={k} style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', paddingBottom: 4 }}>
              {k}-kurs
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', paddingRight: 6, paddingBottom: 4 }}>
            Jami
          </div>

          {qatorlar.map((r) => (
            <Fragment key={r.fakultet}>
              <div
                title={r.fakultet}
                style={{
                  fontSize: 12,
                  paddingRight: 10,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {qisqart(34)(r.fakultet)}
              </div>
              {r.kurs.map((v, i) => {
                const b = v > 0 && max > 0 ? bin(v) : -1;
                const fon = b < 0 ? BOSH_KATAK : RAMPA[b];
                const rang = b >= 5 ? theme.card : b < 0 ? 'var(--muted)' : 'var(--text)';
                return (
                  <div
                    key={KURSLAR[i]}
                    title={`${r.fakultet} · ${KURSLAR[i]}-kurs — ${fmt(v)} talaba`}
                    style={{
                      background: fon,
                      color: rang,
                      fontSize: 12,
                      textAlign: 'center',
                      padding: '7px 4px',
                      borderRadius: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {v ? fmt(v) : '—'}
                  </div>
                );
              })}
              <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', paddingRight: 6, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(r.jami)}
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Shkala — 7 qadam och → to'q, alohida neytral katak izohi */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 10, fontSize: 11.5, color: 'var(--muted)' }}>
        <span style={{ marginRight: 3 }}>kam</span>
        {RAMPA.map((c) => (
          <span key={c} style={{ width: 22, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ marginLeft: 3 }}>ko‘p</span>
        <span style={{ marginLeft: 14, width: 22, height: 10, borderRadius: 2, background: BOSH_KATAK }} />
        <span>talaba yo‘q</span>
      </div>
    </div>
  );
}

export default function BakalavrGrafiklar({ fakStat = [], mutStat = [] }) {
  // Faqat bakalavriat qatorlari (fakultet × kurs × jins)
  const bak = useMemo(() => (fakStat || []).filter((r) => r.talim_turi === 'Bakalavr'), [fakStat]);
  const bakJami = useMemo(() => bak.reduce((a, r) => a + (r.soni || 0), 0), [bak]);
  const bakAyol = useMemo(() => bak.filter((r) => r.jinsi === 'ayol').reduce((a, r) => a + (r.soni || 0), 0), [bak]);
  const ayolUlush = foiz(bakAyol, bakJami);

  // A/B/C — ta'lim turi bo'yicha eng ko'p talabali mutaxassisliklar
  const topBak = useMemo(() => topMutaxassislik(mutStat || [], 'Bakalavr', 8), [mutStat]);
  const topMag = useMemo(() => topMutaxassislik(mutStat || [], 'Magistr', 10), [mutStat]);
  const topOrd = useMemo(() => topMutaxassislik(mutStat || [], 'Ordinatura', 10), [mutStat]);

  // A izohi — eng katta mutaxassislik ulushi (Davolash ishi ustunligi grafikning asosiy xabari)
  const bakBosh = topBak.qatorlar[0];
  const topBakIzoh =
    topBak.jami && bakBosh && !bakBosh.boshqa
      ? `${bakBosh.mutaxassislik} — ${foizMatn(foiz(bakBosh.soni, topBak.jami))} (${fmt(bakBosh.soni)})`
      : undefined;

  // D — kurs × jins (1…6-kurs doim ko'rsatiladi)
  const kursJins = useMemo(() => {
    const m = Object.fromEntries(KURSLAR.map((k) => [k, { kurs: `${k}-kurs`, ayol: 0, erkak: 0 }]));
    bak.forEach((r) => {
      const k = m[r.kurs];
      if (k && (r.jinsi === 'ayol' || r.jinsi === 'erkak')) k[r.jinsi] += r.soni || 0;
    });
    return KURSLAR.map((k) => m[k]);
  }, [bak]);

  // E — fakultet × kurs matritsasi (jami bo'yicha kamayish tartibida) va maksimal katak
  const issiqlik = useMemo(() => {
    const m = {};
    bak.forEach((r) => {
      const f = (m[r.fakultet] ||= { fakultet: r.fakultet, jami: 0, kurs: KURSLAR.map(() => 0) });
      f.jami += r.soni || 0;
      if (r.kurs >= 1 && r.kurs <= 6) f.kurs[r.kurs - 1] += r.soni || 0;
    });
    const qatorlar = Object.values(m).sort((a, b) => b.jami - a.jami);
    const max = qatorlar.reduce((a, r) => Math.max(a, ...r.kurs), 0);
    return { qatorlar, max };
  }, [bak]);

  // F — fakultetlar bo'yicha jins ulushi (ayollar ulushi bo'yicha kamayish tartibida).
  // Erkaklar foizi 100 dan ayirib olinadi — yaxlitlashdan stack 100 dan oshib/kam bo'lmasin.
  const jinsUlushi = useMemo(() => {
    const m = {};
    bak.forEach((r) => {
      const f = (m[r.fakultet] ||= { fakultet: r.fakultet, jami: 0, ayol: 0, erkak: 0 });
      f.jami += r.soni || 0;
      if (r.jinsi === 'ayol' || r.jinsi === 'erkak') f[r.jinsi] += r.soni || 0;
    });
    return Object.values(m)
      .filter((f) => f.jami > 0)
      .map((f) => {
        const ayolFoiz = foiz(f.ayol, f.jami);
        return { ...f, ayolFoiz, erkakFoiz: Math.round((100 - ayolFoiz) * 10) / 10 };
      })
      .sort((a, b) => b.ayolFoiz - a.ayolFoiz || String(a.fakultet).localeCompare(String(b.fakultet)));
  }, [bak]);

  // D izohi — 6-kurs qaysi fakultetlarda bor (ma'lumotdan hisoblanadi)
  const kurs6 = useMemo(
    () => ({
      soni: issiqlik.qatorlar.reduce((a, r) => a + r.kurs[5], 0),
      fakultetlar: issiqlik.qatorlar.filter((r) => r.kurs[5] > 0).length,
    }),
    [issiqlik]
  );
  const fakSoni = issiqlik.qatorlar.length;
  const kurs6Izoh =
    kurs6.fakultetlar < fakSoni
      ? `6-kurs — ${fmt(kurs6.soni)} talaba, ${kurs6.fakultetlar} fakultetda (qolgan fakultetlarda 6-kurs yo‘q).`
      : `6-kurs — ${fmt(kurs6.soni)} talaba, barcha ${kurs6.fakultetlar} fakultetda.`;

  const bakIzoh = bakJami ? `${fmt(bakJami)} talaba · ${fakSoni} fakultet · ${MANBA}` : MANBA;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 1 — Mutaxassisliklar kesimi. A to'liq kenglikda: Davolash ishi (63 %) qolgan barlarni siqadi,
          tor ustunda ular ko'rinmas bo'lib qolar edi; B va C yonma-yon */}
      <Card title="Mutaxassisliklar kesimi" subtitle={`eng ko‘p talabali mutaxassisliklar — ta‘lim turlari bo‘yicha · ${MANBA}`}>
        <div style={{ display: 'grid', gap: 24 }}>
          <div>
            <GrafikSarlavha izoh={topBakIzoh}>Bakalavriat — eng ko‘p talabali 8 mutaxassislik</GrafikSarlavha>
            <MutaxassislikBar qatorlar={topBak.qatorlar} />
            <MutaxassislikIzoh t={topBak} />
          </div>
          <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
            <div>
              <GrafikSarlavha izoh={topMag.jami ? `${fmt(topMag.jami)} talaba` : undefined}>
                Magistratura — eng ko‘p talabali 10 mutaxassislik
              </GrafikSarlavha>
              <MutaxassislikBar qatorlar={topMag.qatorlar} />
              <MutaxassislikIzoh t={topMag} />
            </div>
            <div>
              <GrafikSarlavha izoh={topOrd.jami ? `${fmt(topOrd.jami)} talaba` : undefined}>
                Klinik ordinatura — eng ko‘p talabali 10 mutaxassislik
              </GrafikSarlavha>
              <MutaxassislikBar qatorlar={topOrd.qatorlar} />
              <MutaxassislikIzoh t={topOrd} />
            </div>
          </div>
        </div>
      </Card>

      {/* 2 — Bakalavr kontingenti jins kesimida: kurslar bo'yicha (D) va fakultetlar bo'yicha ulush (F) */}
      <Card title="Bakalavr kontingenti — kurs va fakultetlar bo‘yicha jins kesimida" subtitle={bakIzoh}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="o‘lchov — nafar">Bakalavr — kurs va jins kesimida</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={kursJins} margin={{ top: 4, right: 16, left: 8 }} barGap={2}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="kurs" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="ayol" name="Ayollar" fill={chartColors[0]} radius={RADIUS_V} barSize={18} isAnimationActive={false} />
                <Bar dataKey="erkak" name="Erkaklar" fill={chartColors[1]} radius={RADIUS_V} barSize={18} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>{bakJami > 0 ? kurs6Izoh : 'Ma‘lumot yo‘q'}</ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh={bakJami ? `bakalavriat o‘rtachasi — ayollar ${foizMatn(ayolUlush)}` : undefined}>
              Qaysi fakultetlarda ayollar ulushi o‘rtachadan yuqori?
            </GrafikSarlavha>
            <ResponsiveContainer width="100%" height={barBalandlik(jinsUlushi.length)}>
              <BarChart data={jinsUlushi} layout="vertical" margin={{ top: 18, right: 16, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v} %`}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="fakultet"
                  type="category"
                  width={150}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={qisqart(26)}
                />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  formatter={(v, n, item) => {
                    const nafar = item && item.payload ? item.payload[SON_KALIT[item.dataKey]] : undefined;
                    return [nafar === undefined ? foizMatn(v) : `${foizMatn(v)} (${fmt(nafar)} nafar)`, n];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                {bakJami > 0 && (
                  <ReferenceLine
                    x={ayolUlush}
                    stroke={theme.muted}
                    strokeWidth={1}
                    label={{ value: `O‘rtacha ${foizMatn(ayolUlush)}`, position: 'top', fontSize: 11, fill: theme.muted }}
                  />
                )}
                <Bar dataKey="ayolFoiz" name="Ayollar" stackId="j" fill={chartColors[0]} barSize={14} isAnimationActive={false} />
                <Bar dataKey="erkakFoiz" name="Erkaklar" stackId="j" fill={chartColors[1]} radius={RADIUS_H} barSize={14} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>
              {bakJami > 0
                ? 'Ulush — fakultet jami talabalariga nisbatan; o‘rtacha chiziq — barcha bakalavr talabalar bo‘yicha.'
                : 'Ma‘lumot yo‘q'}
            </ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* 3 — Fakultet × kurs issiqlik xaritasi — to'liq kenglikda (7 ustun + yorliq tor ustunga sig'maydi);
          quyidagi fakultet jadvalining vizual xulosasi, to'liq raqamlar o'sha jadvalda */}
      <Card title="Fakultet × kurs — issiqlik xaritasi" subtitle={`bakalavriat · ${MANBA}`} extra={bakJami > 0 ? `${fakSoni} fakultet` : undefined}>
        <GrafikSarlavha izoh="katak — shu kursdagi talabalar soni">Qaysi fakultetda qaysi kurs eng gavjum?</GrafikSarlavha>
        {bakJami > 0 && <IssiqlikXaritasi qatorlar={issiqlik.qatorlar} max={issiqlik.max} />}
        <ManbaIzoh>
          {bakJami > 0
            ? 'Fakultetlar jami talabalar soni bo‘yicha kamayish tartibida; «—» — bu kursda talaba yo‘q · to‘liq raqamlar — quyidagi jadvalda.'
            : 'Ma‘lumot yo‘q'}
        </ManbaIzoh>
      </Card>
    </div>
  );
}
