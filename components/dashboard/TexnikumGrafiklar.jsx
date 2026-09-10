'use client';

// Texnikumlar bo'limi — qo'shimcha tahliliy grafiklar (2026 anketa yig'masi).
// Dashboard'da KPI/grafik kartasi bilan hudud jadvali orasiga qo'yiladi.
// Qoidalar: chartColors tartibi qat'iy; nominal kategoriya (hudud, muassasa) → bitta rang;
// tartibli o'n yilliklar → ramp(); tooltip faqat chartTip; animatsiya yo'q; pie/donut yo'q.
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, ReferenceLine,
  DefaultLegendContent,
} from 'recharts';
import { Card } from '../ui.jsx';
import {
  chartColors, fmt, foiz, axisStyle, cursorFill, BAR_MAX, RADIUS_H, RADIUS_V, ramp, qisqart,
  GrafikSarlavha, ManbaIzoh,
} from '../../lib/chart-utils';
import { theme, chartTip } from '../../lib/theme.js';

const MANBA = 'Manba: texnikumlar anketa yig‘masi, 2026 (iyun–iyul).';

// Bir xonali kasr: 15.8 → «15,8» (ru-RU — loyihadagi fmt bilan bir xil ajratgich)
const fmt1 = (n) => (Number(n) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const foizMatn = (v) => `${fmt1(v)} %`;

// Gorizontal bar balandligi — o'q bandi bilan birga (qator × 26 + 70, kamida 180)
const balandlik = (n) => Math.max(180, n * 26 + 70);
const LEGEND_JOY = 30; // legend uchun qo'shimcha balandlik

const labelStyle = { fontSize: 11, fill: theme.muted };
const legendStyle = { fontSize: 12.5 };
const MARGIN = { top: 4, right: 40, left: 8 }; // o'ngda LabelList uchun joy
const MARGIN_CHIZIQ = { top: 16, right: 48, left: 8 }; // ReferenceLine yorlig'i uchun yuqorida joy

// Muassasa turi → rang (tartib qat'iy: Davlat 1-, Xususiy 2-rang)
const TURI_RANG = { Davlat: chartColors[0], Xususiy: chartColors[1] };
const TURI_LEGEND = [
  { id: 'Davlat', value: 'Davlat', color: chartColors[0], type: 'circle' },
  { id: 'Xususiy', value: 'Xususiy', color: chartColors[1], type: 'circle' },
];
// Recharts 3 Legend'da `payload` prop yo'q — rang Cell orqali berilganda legend `content` bilan chiziladi
const turiLegend = () => (
  <DefaultLegendContent
    payload={TURI_LEGEND}
    iconType="circle"
    iconSize={14}
    layout="horizontal"
    align="center"
    verticalAlign="bottom"
    inactiveColor={theme.muted}
  />
);

// Tashkil yili o'n yilliklari — tartibli binlar. Oltita asosiy bin doim ko'rsatiladi (0 bo'lsa ham),
// ma'lumotda boshqa o'n yillik (masalan 1970-yillar) uchrasa, xronologik o'rniga qo'shiladi.
const ASOSIY_BINLAR = [1960, 1980, 1990, 2000, 2010, 2020];
const binKaliti = (yil) => (yil < 1970 ? 1960 : Math.floor(yil / 10) * 10);
const binNomi = (k) => (k === 1960 ? '1970 gacha' : `${k}-yillar`);

// Tooltip: qator ma'lumotini olish (Recharts 3: formatter(value, name, item) — item.payload = qator)
const qator = (item) => (item && item.payload) || {};

// Bir ko'rsatkichli panel (small multiples): bitta ko'rsatkich, bitta rang, barcha panellarda bir xil hudud tartibi
function KichikPanel({ sarlavha, dataKey, data }) {
  return (
    <div>
      <GrafikSarlavha>{sarlavha}</GrafikSarlavha>
      <ResponsiveContainer width="100%" height={balandlik(data.length)}>
        <BarChart data={data} layout="vertical" margin={MARGIN}>
          <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
          <Bar dataKey={dataKey} name={sarlavha} fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
            <LabelList dataKey={dataKey} position="right" formatter={fmt} style={labelStyle} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TexnikumGrafiklar({ texStat = [], muassasalar = [] }) {
  // Anketa topshirmagan (barcha ko'rsatkichi 0) hududlar — nisbat/son grafiklaridan chiqariladi.
  // Tartib: o'quvchilar soni bo'yicha kamayish (kichik ko'plik panellari shu tartibni ulashadi).
  const toliq = useMemo(
    () => texStat.filter((r) => (r.oquvchilar || 0) > 0).sort((a, b) => (b.oquvchilar || 0) - (a.oquvchilar || 0)),
    [texStat]
  );
  const chiqarilgan = useMemo(() => texStat.filter((r) => !((r.oquvchilar || 0) > 0)).map((r) => r.hudud), [texStat]);
  const chiqarilganIzoh = chiqarilgan.length ? ` ${chiqarilgan.join(', ')} — anketa topshirmagan, hisobga olinmadi.` : '';

  // A. Bir pedagogga to'g'ri keladigan o'quvchilar (bir xonali kasr), kamayish tartibida
  const nisbat = useMemo(
    () =>
      toliq
        .filter((r) => (r.pedagoglar || 0) > 0)
        .map((r) => ({
          hudud: r.hudud,
          oquvchilar: r.oquvchilar,
          pedagoglar: r.pedagoglar,
          nisbat: Math.round((r.oquvchilar / r.pedagoglar) * 10) / 10,
        }))
        .sort((a, b) => b.nisbat - a.nisbat),
    [toliq]
  );
  // Respublika o'rtachasi — nisbatlar o'rtachasi EMAS, Σo'quvchilar / Σpedagoglar (kiritilgan hududlar)
  const ortacha = useMemo(() => {
    const oq = nisbat.reduce((a, r) => a + r.oquvchilar, 0);
    const ped = nisbat.reduce((a, r) => a + r.pedagoglar, 0);
    return ped ? Math.round((oq / ped) * 10) / 10 : 0;
  }, [nisbat]);
  // O'quvchisi bor, lekin pedagoglar soni 0 (ko'rsatilmagan) hududlar — nisbat hisoblanmaydi, izohda aytiladi
  const pedNol = useMemo(() => toliq.filter((r) => !((r.pedagoglar || 0) > 0)).map((r) => r.hudud), [toliq]);
  const pedNolIzoh = pedNol.length ? ` ${pedNol.join(', ')} — pedagoglar soni ko‘rsatilmagan, nisbat hisoblanmadi.` : '';

  // B. Bitiruvchilar va qabul kvotasi — kvota bo'yicha kamayish tartibida
  const kvota = useMemo(() => [...toliq].sort((a, b) => (b.qabul_kvota || 0) - (a.qabul_kvota || 0)), [toliq]);

  // C. Eng yirik 10 ta muassasa (o'quvchisi bor bo'lganlar orasida)
  const top10 = useMemo(
    () =>
      muassasalar
        .filter((m) => (m.oquvchilar || 0) > 0)
        .sort((a, b) => b.oquvchilar - a.oquvchilar)
        .slice(0, 10)
        .map((m) => ({ ...m, nom: m.qisqa_nomi || m.nomi })),
    [muassasalar]
  );

  // D. Xususiy sektor kontingenti — qaysi hududlarda va qancha. Hudud × turi yig'indisi; xususiy o'quvchisi bor
  // hududlar matn sifatida beriladi (13 qatorli davlat/xususiy stack o'rniga — 11 qatorda xususiy segment 0 edi).
  const xususiy = useMemo(() => {
    const m = {};
    let jami = 0;
    let xususiyJami = 0;
    muassasalar.forEach((r) => {
      const h = (m[r.hudud] ||= { hudud: r.hudud, jami: 0, xususiy: 0 });
      const soni = r.oquvchilar || 0;
      h.jami += soni;
      jami += soni;
      if (r.turi === 'Xususiy') {
        h.xususiy += soni;
        xususiyJami += soni;
      }
    });
    const hududlar = Object.values(m).filter((h) => h.jami > 0); // jami 0 (anketa yo'q) hududlar tushiriladi
    const bor = hududlar
      .filter((h) => h.xususiy > 0)
      .sort((a, b) => b.xususiy - a.xususiy)
      .map((h) => ({ ...h, ulush: foiz(h.xususiy, h.jami) }));
    const xususiyMuassasa = muassasalar.filter((r) => r.turi === 'Xususiy');
    return {
      xususiyJami,
      ulush: foiz(xususiyJami, jami),
      hududlar: bor,
      yoqHudud: hududlar.length - bor.length,
      muassasaSoni: xususiyMuassasa.length,
      anketaSoni: xususiyMuassasa.filter((r) => r.anketa || (r.oquvchilar || 0) > 0).length,
    };
  }, [muassasalar]);

  // E. Tashkil etilgan yili — o'n yilliklar (ma'lum bo'lganlar bo'yicha)
  const yillar = useMemo(() => {
    const soni = {};
    let malum = 0;
    let nomalumXususiy = 0; // yili noma'lum xususiy muassasalar — bo'shliq deyarli to'liq shu sektorda
    let xususiyJami = 0;
    muassasalar.forEach((m) => {
      const xususiyMi = m.turi === 'Xususiy';
      if (xususiyMi) xususiyJami += 1;
      const yil = Number(m.tashkil_yili);
      if (!yil) {
        if (xususiyMi) nomalumXususiy += 1;
        return;
      }
      malum += 1;
      const k = binKaliti(yil);
      soni[k] = (soni[k] || 0) + 1;
    });
    const kalitlar = [...new Set([...ASOSIY_BINLAR, ...Object.keys(soni).map(Number)])].sort((a, b) => a - b);
    const data = kalitlar.map((k) => ({ bin: binNomi(k), soni: soni[k] || 0 }));
    return {
      malum,
      nomalum: muassasalar.length - malum,
      nomalumXususiy,
      xususiyJami,
      nolBinlar: data.filter((d) => d.soni === 0).map((d) => d.bin), // 0 ko'rsatilgan o'n yilliklar
      data,
    };
  }, [muassasalar]);
  // Manba izohi: noma'lumlar orasida xususiy sektor ulushi va bundan kelib chiqadigan bo'shliq
  const yilIzoh = useMemo(() => {
    const { nomalum, nomalumXususiy, xususiyJami, nolBinlar } = yillar;
    let s = `${fmt(nomalum)} ta muassasa tashkil yilini ko‘rsatmagan (shundan ${fmt(nomalumXususiy)} tasi xususiy, ${fmt(xususiyJami)} tadan)`;
    if (xususiyJami > 0 && nomalumXususiy > xususiyJami / 2) {
      s += ' — xususiy sektor bu grafikda deyarli aks etmagan';
      if (nolBinlar.length) s += `; ${nolBinlar.join(', ')} bo‘yicha 0 shu bilan bog‘liq bo‘lishi mumkin`;
    }
    return `${s}.`;
  }, [yillar]);
  const yilRang = useMemo(() => ramp(yillar.data.length), [yillar.data.length]);

  // Anketa topshirgan muassasalar soni (karta sarlavhasi uchun)
  const anketaSoni = useMemo(() => muassasalar.filter((m) => m.anketa || (m.oquvchilar || 0) > 0).length, [muassasalar]);

  // F. Anketa to'liqligi ulushi — muassasasi bor barcha hududlar (Xorazm ham: 0 % — bu haqiqiy qiymat)
  const anketa = useMemo(
    () =>
      texStat
        .map((r) => ({ hudud: r.hudud, muassasa: (r.davlat || 0) + (r.nodavlat || 0), anketa_tuliq: r.anketa_tuliq || 0 }))
        .filter((r) => r.muassasa > 0)
        .map((r) => ({ ...r, ulush: foiz(r.anketa_tuliq, r.muassasa) }))
        .sort((a, b) => b.ulush - a.ulush),
    [texStat]
  );
  const anketaJami = useMemo(() => {
    const t = anketa.reduce((a, r) => a + r.anketa_tuliq, 0);
    const m = anketa.reduce((a, r) => a + r.muassasa, 0);
    return { t, m, ulush: foiz(t, m) };
  }, [anketa]);
  const anketaNol = anketa.filter((r) => r.ulush === 0).map((r) => `${r.hudud} (${r.muassasa} ta muassasa)`);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* ---- 1. Kadrlar va bitiruvchilar ---- */}
      <Card title="Kadrlar va bitiruvchilar — hudud kesimida" subtitle="anketa yig‘masi, 2026 · o‘quvchi/pedagog nisbati, bitiruvchilar va qabul kvotasi" extra={`${toliq.length} hudud`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="o‘quvchilar ÷ pedagoglar">Bir pedagogga to‘g‘ri keladigan o‘quvchilar</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={balandlik(nisbat.length)}>
              <BarChart data={nisbat} layout="vertical" margin={MARGIN_CHIZIQ}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  formatter={(v, n, item) => {
                    const q = qator(item);
                    return [`${fmt1(v)} (${fmt(q.oquvchilar)} o‘quvchi / ${fmt(q.pedagoglar)} pedagog)`, n];
                  }}
                />
                <Bar dataKey="nisbat" name="O‘quvchi / pedagog" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                  <LabelList dataKey="nisbat" position="right" formatter={fmt1} style={labelStyle} />
                </Bar>
                {ortacha > 0 && (
                  <ReferenceLine
                    x={ortacha}
                    stroke={theme.muted}
                    strokeWidth={1}
                    label={{ value: `O‘rtacha ${fmt1(ortacha)}`, position: 'top', fontSize: 11, fill: theme.muted }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <GrafikSarlavha izoh="kvota bo‘yicha tartiblangan">Bitiruvchilar (2025/26) va qabul kvotasi (2025)</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={balandlik(kvota.length) + LEGEND_JOY}>
              <BarChart data={kvota} layout="vertical" margin={MARGIN} barGap={2}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
                <Legend wrapperStyle={legendStyle} iconType="circle" />
                <Bar dataKey="bitiruvchi" name="Bitiruvchilar (2025/26)" fill={chartColors[0]} radius={RADIUS_H} barSize={7} isAnimationActive={false} />
                <Bar dataKey="qabul_kvota" name="Qabul kvotasi (2025)" fill={chartColors[1]} radius={RADIUS_H} barSize={7} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ManbaIzoh>
          {MANBA} O‘rtacha — kiritilgan hududlar bo‘yicha Σo‘quvchilar ÷ Σpedagoglar.{chiqarilganIzoh}{pedNolIzoh}
        </ManbaIzoh>
      </Card>

      {/* ---- 2. Infratuzilma — to'rt alohida panel (small multiples): har ko'rsatkich o'z shkalasida ---- */}
      <Card title="Infratuzilma — hudud kesimida" subtitle="anketa yig‘masi, 2026 · har bir ko‘rsatkich alohida shkalada — panellarni o‘zaro solishtirmang" extra={`${toliq.length} hudud`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <KichikPanel sarlavha="Kompyuterlar" dataKey="kompyuterlar" data={toliq} />
          <KichikPanel sarlavha="Laboratoriyalar" dataKey="laboratoriyalar" data={toliq} />
          <KichikPanel sarlavha="Simulyatsion xonalar" dataKey="simulyatsion" data={toliq} />
          <KichikPanel sarlavha="Amaliy / klinik bazalar" dataKey="amaliy_baza" data={toliq} />
        </div>
        <ManbaIzoh>
          {MANBA} Hududlar tartibi — o‘quvchilar soni bo‘yicha, barcha panellarda bir xil.{chiqarilganIzoh}
        </ManbaIzoh>
      </Card>

      {/* ---- 3. Muassasalar kesimi ---- */}
      <Card title="Muassasalar kesimi" subtitle="anketa yig‘masi, 2026 · eng yirik texnikumlar, xususiy sektor va tashkil yili" extra={`anketa topshirgan ${fmt(anketaSoni)} ta muassasa`}>
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start', marginBottom: 24 }}>
          <div>
            <GrafikSarlavha izoh="rang — muassasa turi">Eng yirik texnikumlar — o‘quvchilar soni (top-10)</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={balandlik(top10.length) + LEGEND_JOY}>
              <BarChart data={top10} layout="vertical" margin={MARGIN}>
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="nom" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={qisqart(30)} />
                <Tooltip
                  contentStyle={chartTip}
                  cursor={cursorFill}
                  labelFormatter={(l, p) => (p && p[0] && p[0].payload && p[0].payload.nomi) || l}
                  formatter={(v, n, item) => {
                    const q = qator(item);
                    return [fmt(v), q.turi ? `${n} (${q.turi})` : n];
                  }}
                />
                <Legend wrapperStyle={legendStyle} content={turiLegend} />
                <Bar dataKey="oquvchilar" name="O‘quvchilar" radius={RADIUS_H} barSize={12} isAnimationActive={false}>
                  {top10.map((m) => (
                    <Cell key={`${m.hudud}·${m.nomi}`} fill={TURI_RANG[m.turi] || chartColors[0]} />
                  ))}
                  <LabelList dataKey="oquvchilar" position="right" formatter={fmt} style={labelStyle} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <GrafikSarlavha izoh="anketa ma’lumotlari bo‘yicha">Xususiy texnikumlar qaysi hududlarda o‘quvchi qabul qilgan?</GrafikSarlavha>
            {/* Grafik o'rniga qisqa xulosa: xususiy kontingent bor-yo'g'i bir-ikki hududda — 13 qatorli stack shuni aytolmasdi */}
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: 'var(--primary-dark)' }}>{fmt(xususiy.xususiyJami)}</div>
              <div style={{ color: 'var(--muted)', marginBottom: 10 }}>
                xususiy muassasalardagi o‘quvchilar — jami kontingentning {foizMatn(xususiy.ulush)}
              </div>
              {xususiy.hududlar.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {xususiy.hududlar.map((h) => (
                    <li key={h.hudud}>
                      {h.hudud} — {fmt(h.xususiy)} o‘quvchi (hudud kontingentining {foizMatn(h.ulush)})
                    </li>
                  ))}
                </ul>
              ) : (
                <div>Xususiy muassasalarda kontingent qayd etilmagan.</div>
              )}
              {xususiy.yoqHudud > 0 && (
                <div style={{ marginTop: 8 }}>Qolgan {fmt(xususiy.yoqHudud)} hududda xususiy kontingent qayd etilmagan.</div>
              )}
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>
                {fmt(xususiy.muassasaSoni)} ta xususiy muassasadan {fmt(xususiy.anketaSoni)} tasi anketa topshirgan; qolganlarining
                kontingenti ma’lum emas.
              </div>
            </div>
          </div>
        </div>

        <GrafikSarlavha izoh="tartibli o‘n yilliklar">
          Tashkil etilgan yili — o‘n yilliklar bo‘yicha ({fmt(yillar.malum)} ta ma’lum)
        </GrafikSarlavha>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={yillar.data} margin={{ top: 20, right: 16, left: 8 }}>
            <XAxis dataKey="bin" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
            <Bar dataKey="soni" name="Muassasalar" radius={RADIUS_V} barSize={BAR_MAX} isAnimationActive={false}>
              {yillar.data.map((d, i) => (
                <Cell key={d.bin} fill={yilRang[i]} />
              ))}
              <LabelList dataKey="soni" position="top" formatter={fmt} style={labelStyle} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ManbaIzoh>
          {MANBA} {yilIzoh}{chiqarilganIzoh}
        </ManbaIzoh>
      </Card>

      {/* ---- 4. Ma'lumot sifati ---- */}
      <Card title="Ma’lumot sifati — anketa to‘liqligi" subtitle="kontingent bo‘limini to‘liq topshirgan muassasalar ulushi, % · 2026" extra={`respublika: ${fmt(anketaJami.t)} / ${fmt(anketaJami.m)} muassasa`}>
        <GrafikSarlavha izoh="kontingent bo‘limini to‘liq topshirgan muassasalar ulushi">Anketa to‘liqligi — hudud kesimida</GrafikSarlavha>
        <ResponsiveContainer width="100%" height={balandlik(anketa.length)}>
          <BarChart data={anketa} layout="vertical" margin={MARGIN_CHIZIQ}>
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v} %`}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={chartTip}
              cursor={cursorFill}
              formatter={(v, n, item) => {
                const q = qator(item);
                return [`${foizMatn(v)} (${fmt(q.anketa_tuliq)} / ${fmt(q.muassasa)} muassasa)`, n];
              }}
            />
            <Bar dataKey="ulush" name="Anketa to‘liqligi" fill={chartColors[0]} radius={RADIUS_H} barSize={12} isAnimationActive={false}>
              <LabelList dataKey="ulush" position="right" formatter={foizMatn} style={labelStyle} />
            </Bar>
            {anketaJami.m > 0 && (
              <ReferenceLine
                x={anketaJami.ulush}
                stroke={theme.muted}
                strokeWidth={1}
                label={{ value: `Respublika ${foizMatn(anketaJami.ulush)}`, position: 'top', fontSize: 11, fill: theme.muted }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        <ManbaIzoh>
          {MANBA} To‘liq deb faqat kontingent (o‘quvchilar) bo‘limi to‘ldirilgan anketalar hisoblandi; boshqa bo‘limlari
          to‘ldirilgan, lekin kontingenti yo‘q anketalar hisobga olinmaydi.
          {anketaNol.length ? ` ${anketaNol.join(', ')} — birorta anketa topshirilmagan, 0 % sifatida ko‘rsatildi.` : ''}
        </ManbaIzoh>
      </Card>
    </div>
  );
}
