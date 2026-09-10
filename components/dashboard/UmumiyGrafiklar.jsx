'use client';

// «Umumiy ko‘rinish» bo'limi — uzluksiz tibbiy ta'lim zanjiri bo'yicha yig'ma grafiklar.
// Xarita qatoridan keyin qo'yiladi. Ma'lumot ota sahifadan prop
// sifatida keladi (texStat — texnikum anketa yig'masi, fakStat — TDTU ro'yxati,
// yonalishlar — klassifikator); bo'sh massivda ham buzilmasdan render bo'ladi.
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, CartesianGrid,
} from 'recharts';
import { Card, Badge, Progress } from '../ui.jsx';
import {
  chartColors, fmt, foiz, axisStyle, gridStroke, cursorFill, BAR_MAX, RADIUS_H, RADIUS_V, ramp,
  GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';

// Zanjir tartibi (tartibli kategoriya → ramp). fakStat'dagi talim_turi kalitlari bilan bog'lanadi.
const BOSQICHLAR = [
  { nomi: 'Texnikum', talimTuri: null },
  { nomi: 'Bakalavriat', talimTuri: 'Bakalavr' },
  { nomi: 'Magistratura', talimTuri: 'Magistr' },
  { nomi: 'Klinik ordinatura', talimTuri: 'Ordinatura' },
  { nomi: 'Doktorantura', talimTuri: 'Doktorantura' }, // dokStat (doktorant_stat) dan
];

// Klassifikator bosqichlari (zanjir tartibida) va DB bo'sh bo'lganda ma'lum sonlar
const YONALISH_BOSQICH = [
  { key: 'texnikum', nomi: 'Texnikum', standart: 10 },
  { key: 'bakalavriat', nomi: 'Bakalavriat', standart: 9 },
  { key: 'magistratura', nomi: 'Magistratura', standart: 26 },
  { key: 'doktorantura', nomi: 'Doktorantura', standart: 18 },
];

// Ma'lum jami sonlar — prop bo'sh kelganda to'liqlik kartasi uchun
const TEX_MUASSASA_JAMI = 125;
const TEX_ANKETA_JAMI = 39;
const TDTU_JAMI = 27739;
const DOK_JAMI = 383;

// Eng och rampa qadami (#d5edea) oq karta fonida deyarli ko'rinmaydi — 6 qadamdan to'q beshtasi olinadi
const RAMP4 = ramp(BOSQICHLAR.length + 1).slice(1);

// (rasmiy kontingent · jins · reyestr), berilmasa avvalgidek 2×2 to'r.
export default function UmumiyGrafiklar({ texStat = [], fakStat = [], dokStat = [], yonalishlar = [] }) {
  // ---- A/B: bosqich kesimida kontingent va jins ----
  const kontingent = useMemo(() => {
    const tex = texStat.reduce((a, r) => a + (r.oquvchilar || 0), 0);
    const texAyol = texStat.reduce((a, r) => a + (r.ayollar || 0), 0);
    const otm = {};
    fakStat.forEach((r) => {
      const t = (otm[r.talim_turi] ||= { ayol: 0, erkak: 0 });
      t[r.jinsi === 'ayol' ? 'ayol' : 'erkak'] += r.soni || 0;
    });
    // Doktorantura (doktorant_stat): jinsi ko'rsatilmaganlar «erkak» emas — jamiga kiradi, ayollarga emas
    dokStat.forEach((r) => {
      const t = (otm.Doktorantura ||= { ayol: 0, erkak: 0 });
      if (r.jinsi === 'ayol') t.ayol += r.soni || 0;
      else t.erkak += r.soni || 0;
    });
    return BOSQICHLAR.map((b) => {
      const otmQator = b.talimTuri ? otm[b.talimTuri] : null;
      const jami = b.talimTuri ? (otmQator?.ayol || 0) + (otmQator?.erkak || 0) : tex;
      // Ayollar soni jamidan oshmasligi kafolatlanadi — ulush 100 % dan oshmaydi, erkaklar manfiy bo'lmaydi
      const ayol = Math.min(jami, b.talimTuri ? (otmQator?.ayol || 0) : texAyol);
      const erkak = jami - ayol;
      const ayolFoiz = foiz(ayol, jami);
      return {
        bosqich: b.nomi,
        jami,
        ayol,
        erkak,
        ayolFoiz,
        // Ikki ulush yig'indisi aynan 100 bo'lishi uchun erkaklar ulushi to'ldiruvchi sifatida olinadi
        erkakFoiz: jami ? Math.round((100 - ayolFoiz) * 10) / 10 : 0,
      };
    });
  }, [texStat, fakStat, dokStat]);

  const jamiKontingent = kontingent.reduce((a, r) => a + r.jami, 0);
  // Jins ulushi — nol kontingentli bosqich nisbatga kirmaydi
  const jinsQatorlar = useMemo(() => kontingent.filter((r) => r.jami > 0), [kontingent]);
  const jinsChiqarilgan = kontingent.filter((r) => r.jami === 0).map((r) => r.bosqich);
  // Anketa topshirmagan hududlar (barcha ko'rsatkichi 0) — izohda aytiladi
  const boshHududlar = useMemo(
    () => texStat.filter((r) => !(r.oquvchilar || 0)).map((r) => r.hudud),
    [texStat]
  );

  // ---- C: manbalar to'liqligi ----
  const dokJami = dokStat.reduce((a, r) => a + (r.soni || 0), 0);
  // Bir xil qoida: prop bo'sh kelganda ma'lum jami, aks holda real yig'indi (0 bo'lsa ham yashirilmaydi)
  const texMuassasa = texStat.length
    ? texStat.reduce((a, r) => a + (r.davlat || 0) + (r.nodavlat || 0), 0)
    : TEX_MUASSASA_JAMI;
  const texAnketa = texStat.length ? texStat.reduce((a, r) => a + (r.anketa_tuliq || 0), 0) : TEX_ANKETA_JAMI;
  const tdtuJami = fakStat.length ? fakStat.reduce((a, r) => a + (r.soni || 0), 0) : TDTU_JAMI;
  const manbalar = [
    {
      nomi: 'Texnikumlar anketasi (kontingent bo‘limi)',
      qiymat: `${fmt(texAnketa)} / ${fmt(texMuassasa)} muassasa · ${fmt(foiz(texAnketa, texMuassasa))} %`,
      value: texAnketa, max: texMuassasa || 1, tone: 'warning', holat: 'Qisman',
    },
    {
      nomi: 'TDTU talabalar ro‘yxati',
      qiymat: `${fmt(tdtuJami)} / ${fmt(tdtuJami)} talaba · ${tdtuJami ? '100' : '0'} %`,
      value: tdtuJami, max: tdtuJami || 1, tone: 'success', holat: 'To‘liq',
    },
    {
      nomi: 'Doktorantura ro‘yxati (PhD / DSc)',
      qiymat: `${fmt(dokJami)} / ${fmt(dokJami || DOK_JAMI)} kishi · ${dokJami ? '100' : '0'} %`,
      value: dokJami, max: dokJami || DOK_JAMI, tone: 'success', holat: dokJami ? 'To‘liq' : 'Yuklanmoqda',
    },
    {
      nomi: 'Grant loyihalari (15 ta)',
      qiymat: '15 / 15 · TDTU 8, Biofarm 7 · Ilm-fan bo‘limida',
      value: 15, max: 15, tone: 'teal', holat: 'Jonli',
    },
  ];

  // ---- D: klassifikator — bosqich kesimida ----
  const yonalishKesimi = useMemo(() => {
    const soni = {};
    yonalishlar.forEach((y) => {
      soni[y.bosqich] = (soni[y.bosqich] || 0) + 1;
    });
    const bosh = yonalishlar.length === 0;
    return YONALISH_BOSQICH.map((b) => ({ bosqich: b.nomi, soni: bosh ? b.standart : soni[b.key] || 0 }));
  }, [yonalishlar]);
  const yonalishJami = yonalishKesimi.reduce((a, r) => a + r.soni, 0);

  const H_A = Math.max(180, kontingent.length * 26 + 70);
  const H_B = Math.max(180, jinsQatorlar.length * 26 + 70) + 30; // + legend qatori

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* A. Zanjir bo'yicha kontingent */}
        {/* Manba bilan ajralib turadi;
            «zanjir» so'zi faqat grafik savolida qoladi */}
        <Card title="Rasmiy kontingent — bosqichlar kesimida" subtitle="texnikum anketasi + TDTU ro‘yxati · 2026" extra={`jami ${fmt(jamiKontingent)} nafar`}>
          <GrafikSarlavha izoh="o‘lchov — nafar">
            Uzluksiz ta‘lim zanjirining har bir bosqichida qancha o‘quvchi va talaba tahsil olmoqda?
          </GrafikSarlavha>
          {jamiKontingent === 0 ? (
            <div style={{ height: H_A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
              Ma‘lumot yuklanmoqda…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={H_A}>
              <BarChart data={kontingent} layout="vertical" margin={{ top: 4, right: 56, left: 8 }}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <YAxis dataKey="bosqich" type="category" width={120} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Bar dataKey="jami" name="Kontingent" radius={RADIUS_H} barSize={BAR_MAX} isAnimationActive={false}>
                  {kontingent.map((r, i) => (
                    <Cell key={r.bosqich} fill={RAMP4[i]} />
                  ))}
                  <LabelList dataKey="jami" position="right" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <ManbaIzoh>
            Manba: texnikumlar anketa yig‘masi (2026, iyun–iyul) · TDTU talabalar ro‘yxati (03.09.2026 holatiga).
            {boshHududlar.length > 0 && ` ${boshHududlar.join(', ')} — anketa topshirmagan, hisobga olinmadi.`}
            {' '}Doktorantura — TDTU doktorantlar ro‘yxati (04.09.2026). Chuqurlashtirilgan sinf — manba hali yuklanmagan (Rejada).
          </ManbaIzoh>
        </Card>

        {/* B. Jins ulushi — 100 % stacked */}
        <Card title="Jins kesimi — bosqichlar bo‘yicha" subtitle="ayollar va erkaklar ulushi, % · 2026">
          <GrafikSarlavha izoh="100 % = bosqich kontingenti">
            Bosqichdan bosqichga ayollar ulushi qanday o‘zgaradi?
          </GrafikSarlavha>
          {jinsQatorlar.length === 0 ? (
            <div style={{ height: H_B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
              Ma‘lumot yuklanmoqda…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={H_B}>
              <BarChart data={jinsQatorlar} layout="vertical" margin={{ top: 4, right: 16, left: 8 }}>
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
                <YAxis dataKey="bosqich" type="category" width={120} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  formatter={(v, n, item) => {
                    const r = (item && item.payload) || {};
                    const soni = item && item.dataKey === 'ayolFoiz' ? r.ayol : r.erkak;
                    return [`${fmt(v)} % (${fmt(soni)} nafar)`, n];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="ayolFoiz" name="Ayollar" stackId="j" fill={chartColors[0]} barSize={BAR_MAX} isAnimationActive={false} />
                <Bar dataKey="erkakFoiz" name="Erkaklar" stackId="j" fill={chartColors[1]} radius={RADIUS_H} barSize={BAR_MAX} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <ManbaIzoh>
            Texnikum: ayollar — anketadagi ko‘rsatkich, erkaklar — o‘quvchilar jamidan farq sifatida hisoblandi.
            OTM bosqichlari — TDTU ro‘yxatidagi jins belgisi.
            {jinsChiqarilgan.length > 0 && ` ${jinsChiqarilgan.join(', ')} — kontingent 0, nisbatga kiritilmadi.`}
          </ManbaIzoh>
        </Card>

        {/* Reyestr (demo) bosqichlar grafigi — ota sahifadan slot sifatida keladi */}
      </div>

      <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* C. Manbalar to'liqligi — grafik emas, o'lchagichli ro'yxat */}
        <Card title="Ma‘lumotlar manbalari va to‘liqlik" subtitle="2026-yil holatiga · manba qamrovi">
          <div style={{ display: 'grid', gap: 16 }}>
            {manbalar.map((m) => (
              <div key={m.nomi} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.nomi}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{m.qiymat}</span>
                  </div>
                  <Progress value={m.value} max={m.max} />
                </div>
                <Badge tone={m.tone}>{m.holat}</Badge>
              </div>
            ))}
          </div>
          <ManbaIzoh>
            «Qisman» — kontingent bo‘limini topshirgan muassasalar bo‘yicha; «Jonli» — platformaga yuklangan va bo‘limda ko‘rsatiladi.
          </ManbaIzoh>
        </Card>

        {/* D. Klassifikator — bosqich kesimida */}
        <Card title="Yo‘nalishlar klassifikatori — bosqich kesimida" subtitle="ETTP yo‘nalishlar klassifikatori" extra={`jami ${fmt(yonalishJami)} ta`}>
          <GrafikSarlavha izoh="yo‘nalishlar soni">
            Klassifikatorda har bosqich uchun nechta yo‘nalish belgilangan?
          </GrafikSarlavha>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yonalishKesimi} margin={{ top: 16, right: 16, left: 8 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="bosqich" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
              {/* Bitta rang: rampa faqat A-grafik (kontingent zanjiri) uchun — ikki rampa yonma-yon
                  turganda to'q rang turli bosqichni bildirib, noto'g'ri moslik tasavvurini beradi */}
              <Bar dataKey="soni" name="Yo‘nalishlar" fill={chartColors[0]} radius={RADIUS_V} barSize={BAR_MAX} isAnimationActive={false}>
                <LabelList dataKey="soni" position="top" formatter={fmt} style={{ fontSize: 11, fill: theme.muted }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ManbaIzoh>
            Manba: ETTP yo‘nalishlar klassifikatori. Klinik ordinatura klassifikatorda alohida bosqich sifatida kiritilmagan.
          </ManbaIzoh>
        </Card>
      </div>
    </div>
  );
}
