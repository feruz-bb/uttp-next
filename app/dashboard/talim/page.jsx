'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { PageHead, Card, StatCard, Progress, DataTable, Segmented, SectionHead, hududNomi } from '../../../components/ui.jsx';
import { getProfiles, getYonalishlar, getTexnikumStat, getTalabaFakultetStat, getDoktorantStat } from '../../../lib/data-service';
import { theme, chartTip } from '../../../lib/theme.js';
import {
  chartColors, fmt, foiz, axisStyle, cursorFill, BAR_MAX, RADIUS_H, ramp, GrafikSarlavha, ManbaIzoh,
} from '../../../lib/chart-utils';

// Canvas 2-yo'nalish («Tibbiyot ta'limi»): uzluksiz zanjir bo'ylab
// «necha kishi o'qimoqda» — bosqich, muassasa, hudud va yo'nalish kesimlari.
// Yuqori qism — rasmiy kontingent (texnikum anketasi 2026 + TDTU ro'yxati 03.09.2026),
// quyi qism — demo xodimlar reyestri (profiles) bo'yicha kesimlar.
// Texnikum kontingenti anketaning kontingent bo'limini topshirgan muassasalar (39/125)
// bo'yicha — qamrov har bir grafik izohida va KPI yorlig'ida ochiq ko'rsatiladi.

const BOSQICHLAR = [
  { id: 'chuqurlashtirilgan_sinf', nom: 'Chuqurlashtirilgan sinf' },
  { id: 'texnikum', nom: 'Texnikum' },
  { id: 'bakalavr', nom: 'Bakalavriat' },
  { id: 'magistr', nom: 'Magistratura' },
  { id: 'rezidentura', nom: 'Klinik ordinatura' },
  { id: 'doktor', nom: 'Doktor (amaliyot)' },
  { id: 'doktorantura', nom: 'Doktorantura (PhD/DSc)' },
];

// «O'qiyotganlar» — amaliyotchi doktordan tashqari barcha bosqichlar
const OQUV_BOSQICHLARI = BOSQICHLAR.filter((b) => b.id !== 'doktor').map((b) => b.id);

// Klassifikator (specializations.bosqich) qiymatlari → jadvalda ko'rinadigan nom
const YONALISH_BOSQICH_NOMI = {
  texnikum: 'Texnikum',
  bakalavriat: 'Bakalavriat',
  magistratura: 'Magistratura',
  rezidentura: 'Klinik ordinatura',
  doktorantura: 'Doktorantura',
};

// Rasmiy kontingent zanjiri — 5 tartibli bosqich (och → to'q rampa, eng och qadam tashlangan)
const ZANJIR_RANG = ramp(6).slice(1);

const MALUMOT_META = 'Ma’lumot yangilangan: texnikum anketasi 2026 · TDTU 03.09.2026 · doktorantura 04.09.2026';
const REYESTR_IZOH = 'Manba: xodimlar reyestri (demo yozuvlar) — real reyestr ulanmagan.';

// Zanjir grafigi rejimi: bosqich soni yoki zanjir jamidagi ulushi
const REJIMLAR = [
  { key: 'soni', label: 'Soni' },
  { key: 'ulush', label: 'Ulush %' },
];

function kesim(profiles, kalitFn, nomFn = (k) => k) {
  const counts = {};
  profiles.forEach((p) => {
    const k = kalitFn(p);
    if (!k) return;
    counts[k] = (counts[k] || 0) + 1;
  });
  const jami = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .map(([k, soni]) => ({ id: k, nom: nomFn(k), soni, ulush: Math.round((soni / jami) * 100) }))
    .sort((a, b) => b.soni - a.soni);
}

// Ma'lumot kelguncha grafik o'rnida ko'rsatiladigan xira qator (nol ustunlar chizilmaydi)
function Yuklanmoqda({ height }) {
  return (
    <div
      style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12.5, color: 'var(--muted)',
      }}
    >
      Ma‘lumot yuklanmoqda…
    </div>
  );
}

export default function TalimZanjiriPage() {
  const [profiles, setProfiles] = useState([]);
  const [yonalishlar, setYonalishlar] = useState([]);
  const [texStat, setTexStat] = useState([]);
  const [fakStat, setFakStat] = useState([]);
  const [dokStat, setDokStat] = useState([]);
  const [rejim, setRejim] = useState('soni');

  useEffect(() => {
    getProfiles().then(setProfiles);
    getYonalishlar().then(setYonalishlar);
    getTexnikumStat().then(setTexStat);
    getTalabaFakultetStat().then(setFakStat);
    getDoktorantStat().then(setDokStat);
  }, []);

  // Texnikumlar — respublika jami (hudud qatorlari yig'indisi; Xorazm 0 bilan qatnashadi).
  // anketa — kontingent bo'limini topshirgan muassasalar soni (anketa_tuliq yig'indisi).
  const texJami = useMemo(
    () =>
      texStat.reduce(
        (a, r) => ({
          davlat: a.davlat + (r.davlat || 0),
          nodavlat: a.nodavlat + (r.nodavlat || 0),
          oquvchilar: a.oquvchilar + (r.oquvchilar || 0),
          ayollar: a.ayollar + (r.ayollar || 0),
          anketa: a.anketa + (r.anketa_tuliq || 0),
        }),
        { davlat: 0, nodavlat: 0, oquvchilar: 0, ayollar: 0, anketa: 0 }
      ),
    [texStat]
  );
  const texMuassasa = texJami.davlat + texJami.nodavlat;
  // Qamrov matni: «39/125»
  const qamrovMatn = `${texJami.anketa}/${texMuassasa}`;

  // Birorta muassasasi ham kontingent bermagan hududlar (barcha ko'rsatkich 0) — izohda aytiladi
  const boshHududlar = useMemo(
    () =>
      texStat
        .filter((r) => (r.davlat || 0) + (r.nodavlat || 0) > 0 && !(r.oquvchilar > 0))
        .map((r) => `${r.hudud} — barcha ${(r.davlat || 0) + (r.nodavlat || 0)} muassasasi`),
    [texStat]
  );

  // TDTU — ta'lim turi bo'yicha jami va ayollar
  const tdtu = useMemo(() => {
    const t = {};
    fakStat.forEach((r) => {
      const k = r.talim_turi;
      if (!t[k]) t[k] = { jami: 0, ayollar: 0 };
      t[k].jami += r.soni || 0;
      if (r.jinsi === 'ayol') t[k].ayollar += r.soni || 0;
    });
    return t;
  }, [fakStat]);
  const tdtuJami = useMemo(() => Object.values(tdtu).reduce((a, v) => a + v.jami, 0), [tdtu]);
  // Doktorantura (doktorant_stat): jami va ayollar (jinsi ko'rsatilmagan 9 nafar ayollarga kirmaydi)
  const dok = useMemo(
    () => dokStat.reduce((a, r) => ({ jami: a.jami + (r.soni || 0), ayollar: a.ayollar + (r.jinsi === 'ayol' ? r.soni || 0 : 0) }), { jami: 0, ayollar: 0 }),
    [dokStat]
  );
  const jamiOqiyotgan = texJami.oquvchilar + tdtuJami + dok.jami;

  // Ma'lumot yuklanganini bilish — bo'sh massivda nol ustunlar va «O'rtacha 0 %» chizilmasin
  const texYuklandi = texStat.length > 0;
  const tdtuYuklandi = fakStat.length > 0;
  const yuklandi = texYuklandi && tdtuYuklandi;

  // Zanjir tartibida 5 bosqich: jami, ayollar, ayollar ulushi (%), zanjir jamidagi ulushi (%)
  const zanjir = useMemo(() => {
    const t = (k) => tdtu[k] || { jami: 0, ayollar: 0 };
    const qatorlar = [
      ['Texnikum', texJami.oquvchilar, texJami.ayollar],
      ['Bakalavriat', t('Bakalavr').jami, t('Bakalavr').ayollar],
      ['Magistratura', t('Magistr').jami, t('Magistr').ayollar],
      ['Klinik ordinatura', t('Ordinatura').jami, t('Ordinatura').ayollar],
      ['Doktorantura', dok.jami, dok.ayollar],
    ];
    const zanjirJami = qatorlar.reduce((a, [, jami]) => a + jami, 0);
    return qatorlar.map(([bosqich, jami, ayollar]) => ({
      bosqich, jami, ayollar, ulush: foiz(ayollar, jami), zanjirUlush: foiz(jami, zanjirJami),
    }));
  }, [texJami, tdtu, dok]);

  // Nisbat grafigi: kontingenti 0 bo'lgan bosqich nisbatga kiritilmaydi (0 ga bo'lish yo'q)
  const jinsQatorlar = useMemo(() => zanjir.filter((r) => r.jami > 0), [zanjir]);
  const jinsChiqarilgan = useMemo(() => zanjir.filter((r) => !(r.jami > 0)).map((r) => r.bosqich), [zanjir]);

  // Umumiy ayollar ulushi — nisbatga kirgan bosqichlar yig'indisi bo'yicha
  const umumiyUlush = useMemo(() => {
    const jami = jinsQatorlar.reduce((a, r) => a + r.jami, 0);
    const ayollar = jinsQatorlar.reduce((a, r) => a + r.ayollar, 0);
    return foiz(ayollar, jami);
  }, [jinsQatorlar]);

  // Qamrov izohi — texnikum ma'lumoti kelgach (aks holda «0/0» chiqmasin)
  const qamrovIzoh = texYuklandi
    ? `Texnikum — anketaning kontingent bo‘limini topshirgan ${qamrovMatn} muassasa bo‘yicha (${fmt(
        texMuassasa - texJami.anketa
      )} muassasa ma’lumot bermagan${boshHududlar.length ? `, shu jumladan ${boshHududlar.join('; ')}` : ''}); `
    : '';
  const qamrovQisqa = texYuklandi
    ? ` Texnikum — ${qamrovMatn} muassasa anketasi${boshHududlar.length ? ` (${boshHududlar.join('; ')} ma’lumot bermagan)` : ''}; TDTU — to‘liq ro‘yxat.`
    : '';

  const H = Math.max(180, zanjir.length * 26 + 70);
  const ulushRejimi = rejim === 'ulush';

  const oquvchilar = useMemo(
    () => profiles.filter((p) => OQUV_BOSQICHLARI.includes(p.hozirgi_bosqich)),
    [profiles]
  );

  const bosqichKesimi = useMemo(() => {
    const counts = {};
    profiles.forEach((p) => {
      counts[p.hozirgi_bosqich] = (counts[p.hozirgi_bosqich] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(counts));
    return BOSQICHLAR.map((b) => ({ ...b, soni: counts[b.id] || 0, max }));
  }, [profiles]);

  const muassasaKesimi = useMemo(
    () => kesim(oquvchilar, (p) => p.hozirgi_muassasa),
    [oquvchilar]
  );
  // Hudud — klassifikator nomi (xom slug emas); noma'lum id bo'lsa o'zi qoladi
  const hududKesimi = useMemo(
    () => kesim(oquvchilar, (p) => p.manzil_viloyat_id, (k) => hududNomi(k) || k),
    [oquvchilar]
  );
  // Yo'nalish — kodi bo'yicha kesim (kalit noyob). Bir xil nomli yo'nalishlar bir nechta bosqichda
  // uchraydi («Pediatriya» — magistratura va doktorantura); jadvalda ikkita bir xil qator ko'rinmasligi
  // uchun faqat takrorlangan nomlarga qavsda bosqich qo'shiladi.
  const yonalishKesimi = useMemo(() => {
    const yon = Object.fromEntries(yonalishlar.map((y) => [y.kodi, y]));
    const qatorlar = kesim(oquvchilar, (p) => p.yonalish_kodi, (k) => yon[k]?.nomi || k);
    const takror = {};
    qatorlar.forEach((r) => {
      takror[r.nom] = (takror[r.nom] || 0) + 1;
    });
    return qatorlar.map((r) => {
      const y = yon[r.id];
      if (takror[r.nom] < 2 || !y?.bosqich) return r;
      return { ...r, nom: `${r.nom} (${YONALISH_BOSQICH_NOMI[y.bosqich] || y.bosqich})` };
    });
  }, [oquvchilar, yonalishlar]);

  const ulushColumns = (birinchiLabel) => [
    { key: 'nom', label: birinchiLabel, rowHeader: true },
    { key: 'soni', label: 'O‘qiyotganlar', numeric: true, render: (r) => fmt(r.soni) },
    {
      key: 'ulush',
      label: 'Ulush',
      render: (r) => (
        <div style={{ minWidth: 140 }}>
          <Progress value={r.ulush} />
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{r.ulush}%</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead
        breadcrumb={[
          { label: 'Bosh sahifa', href: '/' },
          { label: 'Tahlil paneli', href: '/dashboard' },
          { label: 'Ta‘lim zanjiri' },
        ]}
        title="Ta'lim zanjiri"
        subtitle="Uzluksiz tibbiy ta'lim zanjiri — rasmiy kontingent (texnikumlar, TDTU) va reyestrdagi xodimlar kesimlari"
        meta={MALUMOT_META}
      />

      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Jami o‘qiyotganlar"
          value={yuklandi ? fmt(jamiOqiyotgan) : '—'}
          icon="users"
          tone="primary"
          caption={texYuklandi ? `texnikum anketasi ${qamrovMatn} + TDTU + doktorantura` : 'texnikum anketasi + TDTU + doktorantura'}
        />
        <StatCard
          label="Texnikumlar"
          value={texYuklandi ? fmt(texMuassasa) : '—'}
          icon="building"
          tone="teal"
          caption={texYuklandi ? `${texJami.davlat} davlat · ${texJami.nodavlat} xususiy` : undefined}
        />
        <StatCard
          label="TDTU kontingenti"
          value={tdtuYuklandi ? fmt(tdtuJami) : '—'}
          icon="book"
          tone="violet"
          caption={`bakalavr · magistr · ordinatura · doktorantura ${fmt(dok.jami)}`}
        />
        <StatCard label="Reyestrdagi xodimlar" value={fmt(profiles.length)} icon="registry" tone="success" caption="demo yozuvlar" />
      </div>

      {/* Rasmiy kontingent — zanjir bo'ylab (texnikum anketasi + TDTU ro'yxati) */}
      <SectionHead title="Rasmiy kontingent" extra="texnikum anketasi 2026 · TDTU ro‘yxati 03.09.2026 · doktorantura 04.09.2026" />
      <Card
        title="Rasmiy kontingent — zanjir bo‘ylab (2026)"
        subtitle={
          texYuklandi
            ? `texnikum anketasi 2026 (${qamrovMatn} muassasa) · TDTU ro‘yxati 03.09.2026 · doktorantura 04.09.2026`
            : 'texnikum anketasi 2026 · TDTU ro‘yxati 03.09.2026 · doktorantura 04.09.2026'
        }
        extra={yuklandi ? `jami ${fmt(jamiOqiyotgan)} nafar` : undefined}
      >
        <div className="grid cols-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha
              izoh={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  {yuklandi && <span>jami {fmt(jamiOqiyotgan)} nafar · texnikum {qamrovMatn} muassasa</span>}
                  <Segmented options={REJIMLAR} value={rejim} onChange={setRejim} />
                </span>
              }
            >
              {ulushRejimi
                ? 'Har bir bosqich zanjirning qancha ulushini tashkil etadi?'
                : 'Har bir bosqichda necha kishi o‘qimoqda?'}
            </GrafikSarlavha>
            {yuklandi ? (
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={zanjir} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 0 }}>
                  <XAxis
                    type="number"
                    domain={[0, 'auto']}
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={ulushRejimi ? (v) => `${v} %` : fmt}
                  />
                  <YAxis dataKey="bosqich" type="category" width={130} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    formatter={(v, n, item) =>
                      ulushRejimi ? [`${fmt(v)} % (${fmt(item?.payload?.jami)} nafar)`, n] : [fmt(v), n]
                    }
                  />
                  <Bar
                    dataKey={ulushRejimi ? 'zanjirUlush' : 'jami'}
                    name={ulushRejimi ? 'Zanjirdagi ulush' : 'O‘qiyotganlar'}
                    radius={RADIUS_H}
                    barSize={BAR_MAX}
                    isAnimationActive={false}
                  >
                    {zanjir.map((r, i) => (
                      <Cell key={r.bosqich} fill={ZANJIR_RANG[i]} />
                    ))}
                    <LabelList
                      dataKey={ulushRejimi ? 'zanjirUlush' : 'jami'}
                      position="right"
                      formatter={ulushRejimi ? (v) => `${fmt(v)} %` : fmt}
                      style={{ fontSize: 11, fill: theme.muted }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Yuklanmoqda height={H} />
            )}
            <ManbaIzoh>
              {qamrovIzoh}
              TDTU — to‘liq ro‘yxat, 03.09.2026 holatiga; doktorantura — TDTU doktorantlar ro‘yxati, 04.09.2026. Chuqurlashtirilgan sinf — manba hali yuklanmagan (Rejada).
            </ManbaIzoh>
          </div>

          <div>
            <GrafikSarlavha izoh="ayollar / jami, %">Bosqichdan bosqichga ayollar ulushi qanday o‘zgaradi?</GrafikSarlavha>
            {yuklandi ? (
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={jinsQatorlar} layout="vertical" margin={{ top: 18, right: 56, left: 8, bottom: 0 }}>
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v} %`}
                  />
                  <YAxis dataKey="bosqich" type="category" width={130} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTip}
                    cursor={cursorFill}
                    formatter={(v, n, item) => [
                      `${fmt(v)} % (${fmt(item?.payload?.ayollar)} ayol / ${fmt(item?.payload?.jami)} jami)`,
                      n,
                    ]}
                  />
                  <Bar dataKey="ulush" name="Ayollar ulushi" fill={chartColors[0]} radius={RADIUS_H} barSize={BAR_MAX} isAnimationActive={false}>
                    <LabelList dataKey="ulush" position="right" formatter={(v) => `${fmt(v)} %`} style={{ fontSize: 11, fill: theme.muted }} />
                  </Bar>
                  {umumiyUlush > 0 && (
                    <ReferenceLine
                      x={umumiyUlush}
                      stroke={theme.muted}
                      strokeWidth={1}
                      label={{ value: `O‘rtacha ${fmt(umumiyUlush)} %`, position: 'top', fontSize: 11, fill: theme.muted }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Yuklanmoqda height={H} />
            )}
            <ManbaIzoh>
              O‘rtacha — {jinsQatorlar.length} bosqich yig‘indisi bo‘yicha.{qamrovQisqa}
              {jinsChiqarilgan.length > 0 && ` ${jinsChiqarilgan.join(', ')} — kontingent 0, nisbatga kiritilmadi.`}
            </ManbaIzoh>
          </div>
        </div>
      </Card>

      <div style={{ height: 18 }} />

      {/* Reyestr (demo xodimlar) bo'yicha bosqich kesimi — rasmiy kontingent EMAS.
          Rang bitta (primary): qatorlar orasida ma'no farqi yo'q, faqat uzunlik taqqoslanadi. */}
      <SectionHead title="Reyestr (demo)" extra={`${fmt(profiles.length)} nafar · real reyestr ulanmagan`} />
      <Card
        title="Reyestrdagi xodimlar — bosqichlar kesimi (demo)"
        subtitle="Chuqurlashtirilgan sinfdan doktoranturagacha · joriy bosqich bo‘yicha"
        extra={`reyestr: ${profiles.length} nafar`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          {bosqichKesimi.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--primary-soft)', color: 'var(--primary-dark)',
                  fontSize: 12.5, fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span style={{ width: 220, fontSize: 14, fontWeight: 600 }}>{b.nom}</span>
              <div style={{ flex: 1 }}>
                <Progress value={b.soni} max={b.max} tone="var(--primary)" />
              </div>
              <b style={{ width: 70, textAlign: 'right', fontSize: 14 }}>{b.soni} nafar</b>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        <Card title="Muassasalar kesimi" subtitle="o‘qiyotganlar — hozirgi muassasa bo‘yicha · reyestr (demo)" extra={`${muassasaKesimi.length} ta`}>
          <DataTable columns={ulushColumns('Ta’lim muassasasi')} rows={muassasaKesimi} empty="O‘qiyotganlar topilmadi" pageSize={25} footnote={REYESTR_IZOH} />
        </Card>

        <Card title="Hududlar kesimi" subtitle="o‘qiyotganlar — yashash hududi bo‘yicha · reyestr (demo)" extra={`${hududKesimi.length} ta`}>
          <DataTable columns={ulushColumns('Hudud')} rows={hududKesimi} empty="O‘qiyotganlar topilmadi" pageSize={25} footnote={REYESTR_IZOH} />
        </Card>
      </div>

      <Card title="Yo'nalishlar kesimi" subtitle="o‘qiyotganlar — biriktirilgan yo‘nalish bo‘yicha · reyestr (demo)" extra={`${yonalishKesimi.length} ta`}>
        <DataTable columns={ulushColumns('Yo‘nalish / mutaxassislik')} rows={yonalishKesimi} empty="Yo‘nalish biriktirilganlar topilmadi" pageSize={25} footnote={REYESTR_IZOH} />
      </Card>
    </>
  );
}
