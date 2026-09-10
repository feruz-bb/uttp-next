'use client';

// Magistratura bo'limi — TDTU magistr kontingenti («Magistratura» tabining to'liq tanasi).
// Manba: TDTU ro'yxati 03.09.2026 (kontingent, kurs, jins) + magistr fayli 2–3-kurs
// (mutaxassislik shifri, kampus, ta'lim tili, qabul yili — 1 231 nafar).
//  KPI — 4 asosiy plitka (kontingent, mutaxassisliklar, kurslar, o'rtacha yosh) + KPI chizig'i
//        (kampus / til / qabul yili / login);
//  A — yo'nalish guruhlari (ETTP klassifikatoridagi turi) bo'yicha magistrlar (gorizontal bar),
//  B — tug'ilgan yili bo'yicha yosh tarkibi (tartibli binlar → sekvensial turquoise rampa),
//  C/D — kurslar bo'yicha kampus va ta'lim tili (stack, «Ko'rsatilmagan» kulrang),
//  E — eng ko'p talabali 15 mutaxassislikda jins ulushi (100 % stack, magistratura o'rtachasi chizig'i),
//  F — mutaxassisliklar ro'yxati (nom bo'yicha; shifr — klassifikatordagi) jadvali.
// Ranglar: magistr mavjudligi — chartColors[1] (Bakalavriat tabidagi «Magistr» seriyasiga mos);
// kampus/til seriyalari [0], [1] + «Ko'rsatilmagan» chartGray; jins — Ayollar [0], Erkaklar [1].
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Card, StatCard, KpiStrip, Badge, DataTable } from '../ui.jsx';
import {
  chartColors, chartGray, fmt, foiz, axisStyle, gridStroke, cursorFill, BAR_MAX, RADIUS_H, RADIUS_V, ramp, qisqart,
  GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';

const MANBA = 'TDTU ro‘yxati 03.09.2026 · magistr fayli (2–3-kurs)';
const KURSLAR = [2, 3];
const YOSH_YILI = 2026; // yosh shu yilga nisbatan hisoblanadi
const BIN_CHEGARA = 1995; // shu yil va undan oldin tug'ilganlar bitta ustunga yig'iladi
const BIN_OXIRI = 2005; // oxirgi alohida ustun; ma'lumotda kattaroq yil bo'lsa ustunlar shu yilgacha cho'ziladi
const BIN_YORLIQ = `≤ ${BIN_CHEGARA}`; // bitta imlo — o'qda, tooltip'da va izohda
const YORLIQ_SONI_B = 3; // B: yorliq faqat eng katta 3 ustunda
const TOP_MUTAXASSISLIK = 15;

// Shifr → yo'nalish guruhi (turi). Zaxira xarita — Supabase bo'lmaganda (yonalishlar bo'sh) ishlaydi;
// yonalishlar (public.specializations) kelganda uning turi ustunligi bor.
const TURI_ZAXIRA = {
  70530507: 'fundamental',
  70910101: 'stomatologiya', 70910102: 'stomatologiya',
  70910201: 'jarrohlik', 70910202: 'terapevtik', 70910203: 'terapevtik', 70910204: 'jarrohlik',
  70910205: 'terapevtik', 70910206: 'jarrohlik', 70910207: 'terapevtik', 70910208: 'terapevtik',
  70910209: 'terapevtik', 70910210: 'jarrohlik', 70910211: 'terapevtik', 70910212: 'jarrohlik',
  70910214: 'jarrohlik', 70910215: 'profilaktika', 70910217: 'jarrohlik', 70910218: 'fundamental',
  70910219: 'terapevtik', 70910220: 'jarrohlik', 70910221: 'jarrohlik', 70910222: 'fundamental',
  70910223: 'fundamental', 70910226: 'terapevtik', 70910227: 'diagnostika', 70910229: 'jarrohlik',
  70910230: 'fundamental', 70910231: 'profilaktika', 70910234: 'terapevtik',
  70910301: 'pediatriya', 70910302: 'pediatriya', 70910303: 'pediatriya', 70910304: 'pediatriya',
  70910305: 'pediatriya', 70910306: 'pediatriya', 70910307: 'pediatriya', 70910308: 'pediatriya',
  70910401: 'profilaktika', 70910402: 'profilaktika',
  70910701: 'laboratoriya',
  70911201: 'hamshiralik',
};
const TURI_NOMI = {
  terapevtik: 'Terapevtik',
  jarrohlik: 'Jarrohlik',
  pediatriya: 'Pediatriya',
  fundamental: 'Fundamental fanlar',
  diagnostika: 'Diagnostika',
  stomatologiya: 'Stomatologiya',
  profilaktika: 'Jamoat salomatligi va boshqaruv',
  laboratoriya: 'Laboratoriya',
  hamshiralik: 'Hamshiralik',
  boshqa: 'Boshqa guruhlar', // shifri bor, lekin klassifikatorda turi yo'q
  shifrsiz: 'Shifri ko‘rsatilmagan', // magistr faylida yo'q — shifr null
};
// Qoldiq guruhlar — kulrang va ro'yxat oxirida
const KULRANG_TURI = new Set(['boshqa', 'shifrsiz']);
const KORSATILMAGAN = 'Ko‘rsatilmagan';

// Bo'sh shifr (null / '') → null, aks holda satr (DB varchar, zaxira massivda ham satr)
const shifrNorm = (kodi) => (kodi == null || kodi === '' ? null : String(kodi));
const turiKaliti = (kodi, xarita) => (kodi == null ? 'shifrsiz' : xarita[kodi] || 'boshqa');

// Bir xona bilan: 74.06 → «74,1»; foiz matni «74,1 %»
const birXona = (v) =>
  Number(v || 0).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const foizMatn = (v) => `${birXona(v)} %`;
// KPI juftligi: «792 · 461»; ikkalasi ham 0 bo'lsa «—»
const juft = (a, b) => (a || b ? `${fmt(a)} · ${fmt(b)}` : '—');
const jamlash = (rows) => rows.reduce((a, r) => a + (r.soni || 0), 0);
// Gorizontal bar konteyner balandligi — qatorlar × 26 + o'q tasmasi (kamida 180)
const barBalandlik = (n) => Math.max(180, n * 26 + 70);
// B tooltip sarlavhasi — tug'ilgan yil + yosh
const binIzoh = (v) =>
  v === BIN_YORLIQ ? `${v} · ${YOSH_YILI - BIN_CHEGARA} yosh va undan katta` : `${v} · ${YOSH_YILI - Number(v)} yosh`;

// E tooltip: foiz kaliti → nafar kaliti
const SON_KALIT = { ayolFoiz: 'ayol', erkakFoiz: 'erkak' };

// C/D — kurslar bo'yicha stack (gorizontal). Seriyalar tartibi qat'iy: [0], [1], kulrang (radius faqat oxirgida)
function KursStack({ data, seriyalar }) {
  return (
    <ResponsiveContainer width="100%" height={barBalandlik(data.length)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8 }}>
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
        <YAxis dataKey="kurs" type="category" width={56} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
        <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
        <Bar dataKey={seriyalar[0].kalit} name={seriyalar[0].nom} stackId="s" fill={chartColors[0]} barSize={18} isAnimationActive={false} />
        <Bar dataKey={seriyalar[1].kalit} name={seriyalar[1].nom} stackId="s" fill={chartColors[1]} barSize={18} isAnimationActive={false} />
        <Bar dataKey="yoq" name={KORSATILMAGAN} stackId="s" fill={chartGray} radius={RADIUS_H} barSize={18} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const KAMPUS_SERIYA = [
  { kalit: 'kampus2', nom: '2-kampus' },
  { kalit: 'boshBino', nom: 'Bosh bino' },
];
const TIL_SERIYA = [
  { kalit: 'ru', nom: 'Rus tili' },
  { kalit: 'uz', nom: 'O‘zbek tili' },
];

export default function MagistrBolim({
  fakStat = [],
  mutStat = [],
  magStat = [],
  magMutStat = [],
  yoshStat = [],
  yonalishlar = [],
}) {
  // ---- Kontingent (TDTU ro'yxati): jami, jins, kurs ----
  const mag = useMemo(() => (fakStat || []).filter((r) => r.talim_turi === 'Magistr'), [fakStat]);
  const jami = useMemo(() => jamlash(mag), [mag]);
  const ayol = useMemo(() => jamlash(mag.filter((r) => r.jinsi === 'ayol')), [mag]);
  const ayolUlush = foiz(ayol, jami);
  const kursSoni = useMemo(() => KURSLAR.map((k) => jamlash(mag.filter((r) => Number(r.kurs) === k))), [mag]);

  // ---- Magistr fayli kesimi (magStat): kampus, til, qabul yili ----
  const kesim = useMemo(() => {
    const s = (f) => jamlash((magStat || []).filter(f));
    return {
      kampus2: s((r) => r.kampus === '2-kampus'),
      boshBino: s((r) => r.kampus === 'Bosh bino'),
      kampusMalum: s((r) => r.kampus != null && r.kampus !== ''),
      ru: s((r) => r.til === 'ru'),
      uz: s((r) => r.til === 'uz'),
      tilMalum: s((r) => r.til != null && r.til !== ''),
      q2025: s((r) => Number(r.qabul_yili) === 2025),
      q2024: s((r) => Number(r.qabul_yili) === 2024),
    };
  }, [magStat]);

  // C/D — kurs × kampus, kurs × til (2-kurs, 3-kurs doim ko'rsatiladi)
  const kursKampus = useMemo(
    () =>
      KURSLAR.map((k) => {
        const rows = (magStat || []).filter((r) => Number(r.kurs) === k);
        return {
          kurs: `${k}-kurs`,
          kampus2: jamlash(rows.filter((r) => r.kampus === '2-kampus')),
          boshBino: jamlash(rows.filter((r) => r.kampus === 'Bosh bino')),
          yoq: jamlash(rows.filter((r) => r.kampus == null || r.kampus === '')),
        };
      }),
    [magStat]
  );
  const kursTil = useMemo(
    () =>
      KURSLAR.map((k) => {
        const rows = (magStat || []).filter((r) => Number(r.kurs) === k);
        return {
          kurs: `${k}-kurs`,
          ru: jamlash(rows.filter((r) => r.til === 'ru')),
          uz: jamlash(rows.filter((r) => r.til === 'uz')),
          yoq: jamlash(rows.filter((r) => r.til == null || r.til === '')),
        };
      }),
    [magStat]
  );

  // ---- Shifr → turi xaritasi: zaxira + klassifikator (yonalishlar) ustunligi ----
  const turiXarita = useMemo(() => {
    const m = { ...TURI_ZAXIRA };
    (yonalishlar || []).forEach((y) => {
      const kodi = shifrNorm(y && y.kodi);
      if (kodi && y.turi) m[kodi] = y.turi;
    });
    return m;
  }, [yonalishlar]);

  // A — yo'nalish guruhlari bo'yicha magistrlar; kulrang qoldiq guruhlar oxirida
  const guruhlar = useMemo(() => {
    const m = {};
    (magMutStat || []).forEach((r) => {
      const k = turiKaliti(shifrNorm(r.mutaxassislik_kodi), turiXarita);
      m[k] = (m[k] || 0) + (r.soni || 0);
    });
    const royxat = Object.entries(m)
      .filter(([, soni]) => soni > 0)
      .map(([kalit, soni]) => ({ kalit, nom: TURI_NOMI[kalit] || kalit, soni, kulrang: KULRANG_TURI.has(kalit) }))
      .sort((a, b) => b.soni - a.soni || a.nom.localeCompare(b.nom));
    return [...royxat.filter((g) => !g.kulrang), ...royxat.filter((g) => g.kulrang)];
  }, [magMutStat, turiXarita]);
  const magMutJami = useMemo(() => jamlash(magMutStat || []), [magMutStat]);
  const magMutAyol = useMemo(() => jamlash((magMutStat || []).filter((r) => r.jinsi === 'ayol')), [magMutStat]);
  const shifrsizSoni = useMemo(() => (guruhlar.find((g) => g.kalit === 'shifrsiz') || { soni: 0 }).soni, [guruhlar]);
  // Magistr faylida bor talabalar — shifrsizlar bilan bir manbadan (magMutStat); u bo'sh bo'lsa fakStat jami
  const faylda = Math.max(0, (magMutJami || jami) - shifrsizSoni);

  // A izohi — eng katta guruh ulushi
  const boshGuruh = guruhlar[0];
  const guruhIzoh =
    magMutJami && boshGuruh && !boshGuruh.kulrang
      ? `${boshGuruh.nom} — ${foizMatn(foiz(boshGuruh.soni, magMutJami))} (${fmt(boshGuruh.soni)})`
      : undefined;

  // ---- Mutaxassisliklar soni: magMutStat, u bo'sh bo'lsa mutStat (Magistr) ----
  const mutSanoq = useMemo(() => {
    const manba = (magMutStat || []).length
      ? magMutStat
      : (mutStat || []).filter((r) => r.talim_turi === 'Magistr');
    const nomlar = new Set();
    const shifrlar = new Set();
    manba.forEach((r) => {
      if (r.mutaxassislik) nomlar.add(r.mutaxassislik);
      const kodi = shifrNorm(r.mutaxassislik_kodi);
      if (kodi) shifrlar.add(kodi);
    });
    return { nom: nomlar.size, shifr: shifrlar.size };
  }, [magMutStat, mutStat]);

  // ---- B — yosh tarkibi: tartibli binlar («≤ 1995», 1996 … 2005) va o'rtacha yosh ----
  const yosh = useMemo(() => {
    const rows = (yoshStat || []).filter(
      (r) => r.talim_turi === 'Magistr' && r.tugilgan_yil != null && Number.isFinite(Number(r.tugilgan_yil))
    );
    const jamiY = jamlash(rows);
    const yoshYigindi = rows.reduce((a, r) => a + (r.soni || 0) * (YOSH_YILI - Number(r.tugilgan_yil)), 0);
    const ortacha = jamiY ? Math.round((yoshYigindi / jamiY) * 10) / 10 : null;
    // Oxirgi ustun ochiq: ma'lumotda BIN_OXIRI dan keyingi yil bo'lsa, ustunlar shu yilgacha cho'ziladi —
    // shunda ustunlar yig'indisi doim jamiY ga teng (hech bir yil jimgina tashlab yuborilmaydi)
    const oxirgi = rows.reduce((m, r) => Math.max(m, Math.floor(Number(r.tugilgan_yil))), BIN_OXIRI);
    const bins = [
      { yorliq: BIN_YORLIQ, soni: 0 },
      ...Array.from({ length: oxirgi - BIN_CHEGARA }, (_, i) => ({ yorliq: String(BIN_CHEGARA + 1 + i), soni: 0 })),
    ];
    rows.forEach((r) => {
      const y = Math.floor(Number(r.tugilgan_yil));
      const i = y <= BIN_CHEGARA ? 0 : y - BIN_CHEGARA; // 1996 → 1 … oxirgi → bins.length - 1
      bins[i].soni += r.soni || 0;
    });
    // Yorliq faqat eng katta 3 ustunda — indeks bo'yicha (teng qiymatlar ortiqcha yorliq bermaydi)
    const yorliqIdx = new Set(
      bins
        .map((b, i) => [b.soni, i])
        .filter(([v]) => v > 0)
        .sort((a, b) => b[0] - a[0])
        .slice(0, YORLIQ_SONI_B)
        .map(([, i]) => i)
    );
    const binlar = bins.map((b, i) => ({ ...b, yorliqMatn: yorliqIdx.has(i) ? fmt(b.soni) : '' }));
    // Tartibli ustunlar → sekvensial rampa; eng och qadam tashlab yuboriladi (oq fonda ko'rinmaydi)
    const ranglar = ramp(binlar.length + 1).slice(1);
    return { bins: binlar, ranglar, jami: jamiY, ortacha, oldingi: bins[0].soni };
  }, [yoshStat]);

  // ---- E — eng ko'p talabali 15 mutaxassislikda jins ulushi (ayollar ulushi bo'yicha) ----
  // Erkaklar foizi 100 dan ayirib olinadi — yaxlitlashdan stack 100 dan oshib/kam bo'lmasin.
  const jinsUlushi = useMemo(() => {
    const m = {};
    (magMutStat || []).forEach((r) => {
      if (!r.mutaxassislik) return;
      const f = (m[r.mutaxassislik] ||= { mutaxassislik: r.mutaxassislik, jami: 0, ayol: 0, erkak: 0 });
      f.jami += r.soni || 0;
      if (r.jinsi === 'ayol' || r.jinsi === 'erkak') f[r.jinsi] += r.soni || 0;
    });
    return Object.values(m)
      .filter((f) => f.jami > 0)
      .sort((a, b) => b.jami - a.jami || a.mutaxassislik.localeCompare(b.mutaxassislik))
      .slice(0, TOP_MUTAXASSISLIK)
      .map((f) => {
        const ayolFoiz = foiz(f.ayol, f.jami);
        return { ...f, ayolFoiz, erkakFoiz: Math.round((100 - ayolFoiz) * 10) / 10 };
      })
      .sort((a, b) => b.ayolFoiz - a.ayolFoiz || b.jami - a.jami);
  }, [magMutStat]);
  const ulushChizigi = foiz(magMutAyol, magMutJami); // barcha magistr qatorlari bo'yicha ayollar ulushi

  // ---- F — mutaxassisliklar ro'yxati: bir qator = nom (E grafigi va «48 nom» sarlavhasi bilan bir xil guruhlash) ----
  // Shifrsiz (magistr faylida yo'q) talabalar shu nomdagi shifrli qatorga qo'shiladi; shifr — birinchi bo'sh bo'lmagani,
  // «—» faqat hech qachon shifri bo'lmagan nomlarda
  const royxat = useMemo(() => {
    const m = {};
    (magMutStat || []).forEach((r) => {
      const nom = r.mutaxassislik || 'Nomi ko‘rsatilmagan';
      const kodi = shifrNorm(r.mutaxassislik_kodi);
      const f = (m[nom] ||= { kalit: nom, shifr: '', mutaxassislik: nom, k2: 0, k3: 0, jami: 0, ayol: 0 });
      if (kodi && !f.shifr) f.shifr = kodi;
      const n = r.soni || 0;
      f.jami += n;
      if (Number(r.kurs) === 2) f.k2 += n;
      else if (Number(r.kurs) === 3) f.k3 += n;
      if (r.jinsi === 'ayol') f.ayol += n;
    });
    return Object.values(m)
      .map((f) => ({ ...f, turi: TURI_NOMI[turiKaliti(f.shifr || null, turiXarita)] }))
      .sort((a, b) => b.jami - a.jami || a.mutaxassislik.localeCompare(b.mutaxassislik));
  }, [magMutStat, turiXarita]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 1 — KPI + yo'nalish guruhlari (A) va yosh tarkibi (B) */}
      <Card title="Toshkent davlat tibbiyot universiteti — magistratura kontingenti" subtitle={MANBA} extra={jami ? `${fmt(jami)} magistr` : undefined}>
        {/* Asosiy 4 ko'rsatkich — plitkalar; magistr faylidagi kesimlar (kampus, til, qabul yili) va login KPI chizig'ida */}
        <div className="grid stat-grid" style={{ marginBottom: 18 }}>
          <StatCard
            label="Magistr talabalar"
            value={jami ? fmt(jami) : '—'}
            icon="users"
            tone="primary"
            caption={jami ? `${foizMatn(ayolUlush)} ayollar` : undefined}
          />
          <StatCard label="Mutaxassisliklar" value={fmt(mutSanoq.nom)} icon="book" tone="success" caption={`${mutSanoq.shifr} shifr`} />
          <StatCard label="2-kurs · 3-kurs" value={juft(kursSoni[0], kursSoni[1])} icon="clipboard" tone="warning" caption="TDTU ro‘yxati bo‘yicha" />
          <StatCard label="O‘rtacha yosh" value={yosh.ortacha == null ? '—' : birXona(yosh.ortacha)} icon="chart" tone="primary" caption={`${YOSH_YILI} holatiga`} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <KpiStrip
            items={[
              { key: 'kampus', label: 'Kampus: 2-kampus · Bosh bino', value: juft(kesim.kampus2, kesim.boshBino), caption: `ma‘lum: ${fmt(kesim.kampusMalum)} nafar` },
              { key: 'til', label: 'Ta‘lim tili: rus · o‘zbek', value: juft(kesim.ru, kesim.uz), caption: `ma‘lum: ${fmt(kesim.tilMalum)} nafar` },
              { key: 'qabul', label: 'Qabul yili: 2025 · 2024', value: juft(kesim.q2025, kesim.q2024) },
              { key: 'login', label: 'Login va parol berilgan', value: jami ? fmt(jami) : '—' },
            ]}
          />
        </div>

        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh={guruhIzoh}>Yo‘nalish guruhlari bo‘yicha magistrlar — qaysi guruh eng ko‘p?</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={barBalandlik(guruhlar.length)}>
              <BarChart data={guruhlar} layout="vertical" margin={{ top: 4, right: 48, left: 8 }}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <YAxis
                  dataKey="nom"
                  type="category"
                  width={180}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={qisqart(32)}
                />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Bar dataKey="soni" name="Magistrlar" fill={chartColors[1]} radius={RADIUS_H} barSize={14} isAnimationActive={false}>
                  {guruhlar.map((g) => (
                    <Cell key={g.kalit} fill={g.kulrang ? chartGray : chartColors[1]} />
                  ))}
                  <LabelList dataKey="soni" position="right" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>
              {magMutJami > 0
                ? `Yo‘nalish guruhi — ETTP klassifikatoridagi mutaxassislik shifri (turi) bo‘yicha · jami ${fmt(magMutJami)} magistr${
                    shifrsizSoni > 0
                      ? ` · «${TURI_NOMI.shifrsiz}» — magistr faylida bo‘lmagan ${fmt(shifrsizSoni)} nafar (kurs TDTU ro‘yxatidan)`
                      : ''
                  }`
                : 'Ma‘lumot yo‘q'}
            </ManbaIzoh>
          </div>
          <div>
            <GrafikSarlavha izoh={yosh.ortacha != null ? `o‘rtacha yosh — ${birXona(yosh.ortacha)}` : undefined}>
              Yosh tarkibi — magistrlar qaysi yili tug‘ilgan?
            </GrafikSarlavha>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yosh.bins} margin={{ top: 18, right: 8, left: 8 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                {/* Tor kartada (11+ ustun) Recharts ticklarni siyraklashtiradi — birinchi/oxirgi saqlanadi */}
                <XAxis dataKey="yorliq" tick={axisStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  labelFormatter={binIzoh}
                  formatter={(v, n) => [fmt(v), n]}
                />
                <Bar dataKey="soni" name="Talabalar" fill={yosh.ranglar[yosh.ranglar.length - 1]} radius={RADIUS_V} barSize={BAR_MAX} isAnimationActive={false}>
                  {yosh.bins.map((b, i) => (
                    <Cell key={b.yorliq} fill={yosh.ranglar[i]} />
                  ))}
                  {/* yorliqMatn — faqat eng katta 3 ustunda, qolganlarida bo'sh satr */}
                  <LabelList dataKey="yorliqMatn" position="top" style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ManbaIzoh>
              {yosh.jami > 0
                ? `O‘rtacha yosh — ${birXona(yosh.ortacha)} (${YOSH_YILI}-yil holatiga, ${fmt(yosh.jami)} nafar bo‘yicha) · «${BIN_YORLIQ}» ustuni — ${BIN_CHEGARA} va undan oldin tug‘ilgan ${fmt(yosh.oldingi)} nafar · yorliq — eng katta ${YORLIQ_SONI_B} ustunda`
                : 'Ma‘lumot yo‘q'}
            </ManbaIzoh>
          </div>
        </div>
      </Card>

      {/* 2 — magistr fayli: kurslar bo'yicha kampus (C) va ta'lim tili (D) */}
      <Card title="Kurs, kampus va ta‘lim tili" subtitle="magistr fayli (2–3-kurs) · kampus va ta‘lim tili guruh nomidan" extra={`${fmt(faylda)} nafar ma‘lum`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="o‘lchov — nafar">Kurslar bo‘yicha kampus taqsimoti — magistrlar qayerda o‘qiydi?</GrafikSarlavha>
            <KursStack data={kursKampus} seriyalar={KAMPUS_SERIYA} />
          </div>
          <div>
            <GrafikSarlavha izoh="o‘lchov — nafar">Kurslar bo‘yicha ta‘lim tili — magistrlar qaysi tilda o‘qiydi?</GrafikSarlavha>
            <KursStack data={kursTil} seriyalar={TIL_SERIYA} />
          </div>
        </div>
        <ManbaIzoh>
          {jami > 0
            ? `Kampus va ta‘lim tili faqat guruh nomida ko‘rsatilgan holatlarda ma‘lum: kampus — ${fmt(kesim.kampusMalum)}, til — ${fmt(kesim.tilMalum)} nafar (${fmt(faylda)} nafardan); qolganlari — «${KORSATILMAGAN}»${
                shifrsizSoni > 0 ? ` · ${fmt(shifrsizSoni)} magistr magistr faylida umuman yo‘q (kurs TDTU ro‘yxatidan)` : ''
              }`
            : 'Ma‘lumot yo‘q'}
        </ManbaIzoh>
      </Card>

      {/* 3 — mutaxassisliklar bo'yicha jins ulushi (E) */}
      <Card title="Mutaxassisliklar — jins ulushi" subtitle={`eng ko‘p talabali ${TOP_MUTAXASSISLIK} mutaxassislik · magistr fayli (2–3-kurs)`} extra={magMutJami ? `${fmt(magMutJami)} magistr` : undefined}>
        <GrafikSarlavha izoh={magMutJami ? `magistratura o‘rtachasi — ayollar ${foizMatn(ulushChizigi)}` : undefined}>
          Qaysi mutaxassisliklarda ayollar ulushi o‘rtachadan yuqori?
        </GrafikSarlavha>
        <ResponsiveContainer width="100%" height={barBalandlik(jinsUlushi.length)}>
          <BarChart data={jinsUlushi} layout="vertical" margin={{ top: 4, right: 16, left: 8 }}>
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
            {/* padding.top — o'rtacha chiziq yorlig'i (insideTopRight) uchun bo'sh tasma: birinchi qator 100 % bar bo'lsa ham ustiga tushmaydi */}
            <YAxis
              dataKey="mutaxassislik"
              type="category"
              width={170}
              padding={{ top: 18 }}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={qisqart(30)}
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
            {magMutJami > 0 && (
              <ReferenceLine
                x={ulushChizigi}
                stroke={theme.muted}
                strokeWidth={1}
                label={{ value: `O‘rtacha ${foizMatn(ulushChizigi)}`, position: 'insideTopRight', fontSize: 11, fill: theme.muted }}
              />
            )}
            <Bar dataKey="ayolFoiz" name="Ayollar" stackId="j" fill={chartColors[0]} barSize={14} isAnimationActive={false} />
            <Bar dataKey="erkakFoiz" name="Erkaklar" stackId="j" fill={chartColors[1]} radius={RADIUS_H} barSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
        <ManbaIzoh>
          {magMutJami > 0
            ? `Ulush — mutaxassislik jami talabalariga nisbatan (nomi TDTU ro‘yxatidagidek); o‘rtacha chiziq — barcha ${fmt(magMutJami)} magistr bo‘yicha · mutaxassisliklar jami talabalar soni bo‘yicha tanlangan, ayollar ulushi bo‘yicha tartiblangan.`
            : 'Ma‘lumot yo‘q'}
        </ManbaIzoh>
      </Card>

      {/* 4 — mutaxassisliklar ro'yxati (F): bir qator = nom (bir shifr 2 nom variantida uchrashi mumkin — ikkalasi alohida qator) */}
      <Card title="Mutaxassisliklar ro‘yxati" subtitle="bir qator — bir mutaxassislik nomi · shifr — ETTP klassifikatoridagi" extra={`${mutSanoq.nom} nom · ${mutSanoq.shifr} shifr`}>
        <DataTable
          searchable
          numbered
          columns={[
            { key: 'shifr', label: 'Shifr', mono: true, render: (r) => r.shifr || '—' },
            { key: 'mutaxassislik', label: 'Mutaxassislik' },
            { key: 'turi', label: 'Yo‘nalish guruhi', render: (r) => <Badge tone="info">{r.turi}</Badge> },
            { key: 'k2', label: '2-kurs', numeric: true, render: (r) => fmt(r.k2) },
            { key: 'k3', label: '3-kurs', numeric: true, render: (r) => fmt(r.k3) },
            { key: 'jami', label: 'Jami', numeric: true, render: (r) => fmt(r.jami) },
            { key: 'ayol', label: 'Ayollar', numeric: true, render: (r) => `${fmt(r.ayol)} (${foizMatn(foiz(r.ayol, r.jami))})` },
          ]}
          rows={royxat}
          rowKey={(r) => r.kalit}
          empty="Mutaxassislik ma‘lumotlari topilmadi"
          pageSize={25}
          footnote={`Manba: ${MANBA}. Shifrsiz (magistr faylida bo‘lmagan) talabalar shu nomdagi qatorga qo‘shilgan; «—» — shifri ko‘rsatilmagan nomlar.`}
        />
      </Card>
    </div>
  );
}
