'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import UzMap from '../../components/UzMap';
import { PageHead, Card, StatCard, KpiStrip, Badge, DataTable, TabGroup } from '../../components/ui.jsx';
import {
  getTexnikumStat, getTexnikumMuassasalar,
  getTalabaFakultetStat, getTalabaMutaxassislikStat, getYonalishlar,
  getTalabaMagistrStat, getTalabaMagistrMutStat, getTalabaYoshStat,
  getDoktorantStat, getDoktorantRahbarStat,
  getJihozHududStat, getJihozTumanStat, getJihozTuriStat, getJihozMuassasalar,
} from '../../lib/data-service';
import { HUDUD_ID, hududKaliti, HUDUD_NOMDAN_ID } from '../../lib/hududlar';
import { TALABA_MANBA_SANASI } from '../../lib/demo-namunalar';
import UmumiyGrafiklar from '../../components/dashboard/UmumiyGrafiklar';
import TexnikumGrafiklar from '../../components/dashboard/TexnikumGrafiklar';
import BakalavrGrafiklar from '../../components/dashboard/BakalavrGrafiklar';
import MagistrBolim from '../../components/dashboard/MagistrBolim';
import DoktorantBolim from '../../components/dashboard/DoktorantBolim';
import JihozBolim from '../../components/dashboard/JihozBolim';
import { chartTip, chartColors } from '../../lib/theme.js';
import { fmt, foiz, axisStyle, cursorFill, GrafikSarlavha, ManbaIzoh } from '../../lib/chart-utils';

// ---- Hudud ichidagi muassasalar ro'yxati (jadval qatori ostida ochiladi) ----
function HududBatafsil({ r, muassasalar }) {
  // Jadval konteyneridan kengroq bo'lsa panel gorizontal scroll ortida qolib ketadi —
  // shuning uchun kengligi ko'rinadigan sohaga tenglashtiriladi (CSS'da position:sticky).
  const ref = useRef(null);
  const [en, setEn] = useState(null);
  useEffect(() => {
    const wrap = ref.current && ref.current.closest('.table-wrap');
    if (!wrap) return;
    const olcha = () => setEn(wrap.clientWidth);
    olcha();
    const ro = new ResizeObserver(olcha);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const royxat = useMemo(
    () => (muassasalar || []).filter((m) => m.hudud === r.hudud),
    [muassasalar, r.hudud]
  );

  return (
    <div className="hudud-batafsil" ref={ref} style={en ? { width: en } : undefined}>
      <div className="hb-sarlavha">
        {r.hudud} — muassasalar kesimida
        <span className="hb-sarlavha-izoh">{royxat.length} ta texnikum</span>
      </div>
      <DataTable
        numbered
        columns={[
          {
            key: 'nomi',
            label: 'Muassasa',
            render: (m) => (
              <div>
                <div style={{ fontWeight: 600 }}>{m.qisqa_nomi || m.nomi}</div>
                {m.qisqa_nomi && <div className="hb-nom-toliq">{m.nomi}</div>}
              </div>
            ),
          },
          { key: 'turi', label: 'Turi', render: (m) => <Badge tone={m.turi === 'Davlat' ? 'info' : 'accent'}>{m.turi}</Badge> },
          { key: 'tuman', label: 'Tuman / shahar', render: (m) => m.tuman || '—' },
          { key: 'oquvchilar', label: 'O‘quvchilar', numeric: true, render: (m) => (m.oquvchilar ? fmt(m.oquvchilar) : '—') },
          { key: 'davlat_granti', label: 'Grant', numeric: true, render: (m) => (m.oquvchilar ? fmt(m.davlat_granti) : '—') },
          { key: 'kontrakt', label: 'Kontrakt', numeric: true, render: (m) => (m.oquvchilar ? fmt(m.kontrakt) : '—') },
          { key: 'pedagoglar', label: 'Pedagoglar', numeric: true, render: (m) => (m.pedagoglar ? fmt(m.pedagoglar) : '—') },
          { key: 'kompyuterlar', label: 'Kompyuter', numeric: true, render: (m) => (m.kompyuterlar ? fmt(m.kompyuterlar) : '—') },
        ]}
        rows={royxat}
        empty="Bu hududda muassasa topilmadi"
        footnote="Manba: texnikumlar anketa yig‘masi, 2026. «—» — muassasa anketa topshirmagan."
      />
    </div>
  );
}

// ---- Fakultet ichidagi mutaxassisliklar (jadval qatori ostida ochiladi) ----
function FakultetBatafsil({ r, mutStat }) {
  const ref = useRef(null);
  const [en, setEn] = useState(null);
  useEffect(() => {
    const wrap = ref.current && ref.current.closest('.table-wrap');
    if (!wrap) return;
    const olcha = () => setEn(wrap.clientWidth);
    olcha();
    const ro = new ResizeObserver(olcha);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const royxat = useMemo(
    () =>
      (mutStat || [])
        .filter((m) => m.talim_turi === 'Bakalavr' && m.fakultet === r.fakultet)
        .sort((a, b) => b.soni - a.soni)
        .map((m) => ({ ...m, ulush: foiz(m.soni, r.jami) })),
    [mutStat, r]
  );

  return (
    <div className="hudud-batafsil" ref={ref} style={en ? { width: en } : undefined}>
      <div className="hb-sarlavha">
        {r.fakultet} — mutaxassisliklar kesimida
        <span className="hb-sarlavha-izoh">{royxat.length} ta mutaxassislik</span>
      </div>
      <DataTable
        numbered
        columns={[
          { key: 'mutaxassislik', label: 'Mutaxassislik' },
          { key: 'soni', label: 'Talabalar', numeric: true, render: (m) => fmt(m.soni) },
          { key: 'ulush', label: 'Ulush', numeric: true, render: (m) => `${m.ulush}%` },
        ]}
        rows={royxat}
        empty="Bu fakultetda mutaxassislik topilmadi"
        footnote="Ulush — fakultet jami talabalariga nisbatan · TDTU ro‘yxati, 03.09.2026."
      />
    </div>
  );
}



// Xarita id ↔ hudud nomi mosligi — lib/hududlar.js (texnikum va jihoz yig'malari bir xil nomlarni ishlatadi).
const MALUMOT_META = 'Ma’lumot yangilangan: texnikum anketasi 2026 · TDTU 03.09.2026 · doktorantura 04.09.2026 · tibbiy jihozlar 2026';

export default function DashboardPage() {
  const [texStat, setTexStat] = useState([]);
  const [texMuassasalar, setTexMuassasalar] = useState([]);
  const [fakStat, setFakStat] = useState([]);
  const [mutStat, setMutStat] = useState([]);
  const [yonalishlar, setYonalishlar] = useState([]);
  const [magStat, setMagStat] = useState([]);
  const [magMutStat, setMagMutStat] = useState([]);
  const [yoshStat, setYoshStat] = useState([]);
  const [dokStat, setDokStat] = useState([]);
  const [rahbarStat, setRahbarStat] = useState([]);
  const [jihozHudud, setJihozHudud] = useState([]);
  const [jihozTuman, setJihozTuman] = useState([]);
  const [jihozTuri, setJihozTuri] = useState([]);
  const [jihozMuassasa, setJihozMuassasa] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const [tex, muassasa, fak, mut, yon, mag, magMut, yosh, dok, rahbar, jHudud, jTuman, jTuri, jMuassasa] = await Promise.all([
        getTexnikumStat(),
        getTexnikumMuassasalar(),
        getTalabaFakultetStat(),
        getTalabaMutaxassislikStat(),
        getYonalishlar(),
        getTalabaMagistrStat(),
        getTalabaMagistrMutStat(),
        getTalabaYoshStat(),
        getDoktorantStat(),
        getDoktorantRahbarStat(),
        getJihozHududStat(),
        getJihozTumanStat(),
        getJihozTuriStat(),
        getJihozMuassasalar(),
      ]);
      setJihozHudud(jHudud);
      setJihozTuman(jTuman);
      setJihozTuri(jTuri);
      setJihozMuassasa(jMuassasa);
      setDokStat(dok);
      setRahbarStat(rahbar);
      setMagStat(mag);
      setMagMutStat(magMut);
      setYoshStat(yosh);
      setTexStat(tex);
      setTexMuassasalar(muassasa);
      setFakStat(fak);
      setMutStat(mut);
      setYonalishlar(yon);
    })();
  }, []);

  // Texnikumlar — respublika jami (hudud qatorlari yig'indisi)
  const texJami = useMemo(
    () =>
      texStat.reduce(
        (a, r) => {
          for (const k of Object.keys(a)) a[k] += r[k] || 0;
          return a;
        },
        { davlat: 0, nodavlat: 0, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, simulyatsion: 0, laboratoriyalar: 0, amaliy_baza: 0, anketa_tuliq: 0 }
      ),
    [texStat]
  );
  const texMuassasa = texJami.davlat + texJami.nodavlat;

  // Grafikdan hudud bosilganda pastdagi jadvalda o'sha hudud paneli ochiladi
  const [ochiqHudud, setOchiqHudud] = useState(null);
  const jadvalRef = useRef(null);
  const hududniOch = (e) => {
    const hudud = e && e.activeLabel;
    if (!hudud) return;
    setOchiqHudud(hudud);
    if (jadvalRef.current) jadvalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  // Hududlar reytingi — texnikum o'quvchilari bo'yicha (xaritaning raqamli hamrohi, Q12).
  // Tartib: kamayish; har qatorga xarita id'si biriktiriladi (tanlovni ajratish va bosishda tanlash uchun)
  const hududReyting = useMemo(
    () =>
      [...texStat]
        .sort((a, b) => (b.oquvchilar || 0) - (a.oquvchilar || 0))
        .map((r) => ({ hudud: r.hudud, oquvchilar: r.oquvchilar || 0, id: HUDUD_NOMDAN_ID[hududKaliti(r.hudud)] || null })),
    [texStat]
  );
  const reytingBoshHududlar = useMemo(() => hududReyting.filter((r) => !r.oquvchilar).map((r) => r.hudud), [hududReyting]);
  // Bar bosilganda xaritadagi tanlov almashadi (qayta bosish — bekor qiladi)
  const reytingdanTanla = (e) => {
    const id = HUDUD_NOMDAN_ID[hududKaliti(e && e.activeLabel)];
    if (!id) return;
    setSelectedRegion(selectedRegion === id ? null : id);
  };

  // Xarita — texnikum o'quvchilari hudud kesimida (regions.id → oquvchilar)
  const regionStats = useMemo(() => {
    const stats = {};
    hududReyting.forEach((r) => {
      if (r.id) stats[r.id] = r.oquvchilar;
    });
    return stats;
  }, [hududReyting]);

  // Umumiy KPI — rasmiy manbalar
  const tdtuJami = useMemo(() => fakStat.reduce((a, r) => a + (r.soni || 0), 0), [fakStat]);
  const dokJami = useMemo(() => dokStat.reduce((a, r) => a + (r.soni || 0), 0), [dokStat]);
  const jamiOqiyotgan = texJami.oquvchilar + tdtuJami + dokJami;

  // ---- «Umumiy ko'rinish» bo'limi: rasmiy KPI (texnikum + TDTU + doktorantura), GIS xarita, hudud reytingi, zanjir grafiklari ----
  const umumiyBolim = (
    <>
      {/* Asosiy KPI'lar — rasmiy manbalar (texnikum anketasi, TDTU ro'yxati, doktorantura) */}
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Jami o‘qiyotganlar" value={fmt(jamiOqiyotgan)} icon="users" tone="primary" caption="texnikum anketasi + TDTU + doktorantura" />
        <StatCard label="Texnikumlar" value={fmt(texMuassasa)} icon="building" tone="teal" caption={`${texJami.davlat} davlat · ${texJami.nodavlat} nodavlat`} />
        <StatCard label="TDTU kontingenti" value={fmt(tdtuJami)} icon="book" tone="violet" caption="bakalavr · magistr · ordinatura" />
        <StatCard label="Doktorantlar" value={fmt(dokJami)} icon="award" tone="success" caption="PhD · DSc · stajyor" />
      </div>

      {/* GIS xarita + hududlar reytingi (xaritaning raqamli hamrohi) */}
      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        <UzMap
          regionStats={regionStats}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          title="Hududlar bo‘yicha texnikum o‘quvchilari (xarita)"
          subtitle="Hududni bosing — o‘ngdagi reytingda ajratiladi"
          birlik="o‘quvchi"
        />

        <Card
          title="Hududlar bo‘yicha texnikum o‘quvchilari"
          subtitle="anketa yig‘masi, 2026 · o‘quvchilar soni bo‘yicha tartiblangan"
          extra={
            selectedRegion && HUDUD_ID[selectedRegion] ? (
              <Badge tone="info">{HUDUD_ID[selectedRegion]}</Badge>
            ) : (
              `${hududReyting.length} hudud`
            )
          }
        >
          <ResponsiveContainer width="100%" height={Math.max(180, hududReyting.length * 26 + 70)}>
            <BarChart
              data={hududReyting}
              layout="vertical"
              margin={{ top: 4, right: 48, left: 8, bottom: 0 }}
              onClick={reytingdanTanla}
              style={{ cursor: 'pointer' }}
            >
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTip} cursor={cursorFill} formatter={(v, n) => [fmt(v), n]} />
              <Bar dataKey="oquvchilar" name="O‘quvchilar" fill={chartColors[0]} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
                {/* Nominal kategoriya — bitta rang; xaritada tanlov bo'lsa tanlangan hudud primary, qolganlari xira chiziq rangi */}
                {hududReyting.map((r) => (
                  <Cell
                    key={r.hudud}
                    fill={!selectedRegion ? chartColors[0] : r.id === selectedRegion ? 'var(--primary)' : 'var(--line-strong)'}
                  />
                ))}
                <LabelList dataKey="oquvchilar" position="right" formatter={fmt} style={axisStyle} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ManbaIzoh>
            Manba: texnikumlar anketa yig‘masi, 2026 (kontingent bo‘limini topshirgan muassasalar bo‘yicha).
            {reytingBoshHududlar.length > 0 && ` ${reytingBoshHududlar.join(', ')} — anketa topshirmagan (0).`}
            {' '}Barni bosing — xaritada hudud tanlanadi.
          </ManbaIzoh>
        </Card>
      </div>

      {/* Rasmiy manbalar — zanjir kontingenti, jins, ma'lumot to'liqligi, klassifikator */}
      <div style={{ marginBottom: 24 }}>
        <UmumiyGrafiklar texStat={texStat} fakStat={fakStat} dokStat={dokStat} yonalishlar={yonalishlar} />
      </div>
    </>
  );

  // ---- «Texnikumlar» bo'limi — 2026 anketa yig'masi (docs/Texnikumlar_viloyatlar_kesimida_2026) ----
  const texnikumBolim = (
    <>
      <Card
        title="Jamoat salomatligi texnikumlari — respublika monitoringi (2026)"
        subtitle="anketa yig‘masi, 2026 (iyun–iyul) · hudud kesimida"
        extra="14 hudud"
      >
          {/* Asosiy 4 ko'rsatkich — plitkalar; qolgan to'rttasi KPI chizig'ida (grafiklar ustida) */}
          <div className="grid stat-grid" style={{ marginBottom: 18 }}>
            <StatCard label="Texnikumlar" value={fmt(texMuassasa)} icon="building" tone="primary" caption={`${texJami.davlat} davlat · ${texJami.nodavlat} nodavlat`} />
            <StatCard label="O‘quvchilar" value={fmt(texJami.oquvchilar)} icon="users" tone="success" caption={`${foiz(texJami.ayollar, texJami.oquvchilar)}% ayollar`} />
            <StatCard label="Davlat granti" value={fmt(texJami.davlat_granti)} icon="award" tone="warning" caption={`kontrakt: ${fmt(texJami.kontrakt)}`} />
            <StatCard label="Pedagog kadrlar" value={fmt(texJami.pedagoglar)} icon="briefcase" tone="success" caption={`${texJami.vakant} vakant shtat`} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <KpiStrip
              items={[
                { key: 'kvota', label: 'Qabul kvotasi (2025)', value: fmt(texJami.qabul_kvota) },
                { key: 'baza', label: 'Amaliy ta‘lim / klinik bazalar', value: fmt(texJami.amaliy_baza) },
                { key: 'sim', label: 'Simulyatsion xonalar', value: fmt(texJami.simulyatsion), caption: `${texJami.laboratoriyalar} laboratoriya` },
                { key: 'anketa', label: 'Anketa to‘liqligi (kontingent bo‘limi)', value: `${texJami.anketa_tuliq} / ${texMuassasa}`, caption: 'muassasa' },
              ]}
            />
          </div>

          <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
            <div>
              <GrafikSarlavha izoh="davlat · nodavlat">Muassasalar soni — hudud kesimida</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={[...texStat].sort((a, b) => b.davlat + b.nodavlat - (a.davlat + a.nodavlat))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8 }}
                  onClick={hududniOch}
                  style={{ cursor: 'pointer' }}
                >
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTip} formatter={(v, n) => [fmt(v), n]} cursor={cursorFill} />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                  <Bar dataKey="davlat" name="Davlat" stackId="m" fill={chartColors[0]} barSize={13} isAnimationActive={false} />
                  <Bar dataKey="nodavlat" name="Nodavlat" stackId="m" fill={chartColors[1]} radius={[0, 4, 4, 0]} barSize={13} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <GrafikSarlavha izoh="davlat granti · kontrakt">O‘quvchilar — hudud va moliyalashtirish kesimida</GrafikSarlavha>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={texStat}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8 }}
                  barGap={2}
                  onClick={hududniOch}
                  style={{ cursor: 'pointer' }}
                >
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis dataKey="hudud" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTip} formatter={(v, n) => [fmt(v), n]} cursor={cursorFill} />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                  <Bar dataKey="davlat_granti" name="Davlat granti" fill={chartColors[0]} radius={[0, 4, 4, 0]} barSize={7} isAnimationActive={false} />
                  <Bar dataKey="kontrakt" name="Kontrakt" fill={chartColors[1]} radius={[0, 4, 4, 0]} barSize={7} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ManbaIzoh>Manba: texnikumlar anketa yig‘masi, 2026. Grafikdagi hududni bosing — quyidagi jadvalda o‘sha hudud paneli ochiladi.</ManbaIzoh>
      </Card>

      {/* Qo'shimcha kesimlar: kadrlar, infratuzilma, muassasalar, ma'lumot sifati */}
      <div style={{ marginTop: 24 }}>
        <TexnikumGrafiklar texStat={texStat} muassasalar={texMuassasalar} />
      </div>

      {/* Hudud kesimida to'liq ko'rsatkichlar jadvali */}
      <div style={{ marginTop: 24 }} ref={jadvalRef}>
        <Card title="Hudud kesimida to‘liq ko‘rsatkichlar" subtitle="anketa yig‘masidagi barcha metrikalar · qatorni bosing — muassasalar ochiladi" extra={`${texStat.length} hudud`}>
          <DataTable
            searchable
            numbered
            columns={[
              { key: 'hudud', label: 'Hudud', rowHeader: true },
              { key: 'muassasa', label: 'Texnikumlar', numeric: true, render: (r) => `${r.davlat + r.nodavlat} (${r.davlat}D · ${r.nodavlat}N)` },
              { key: 'oquvchilar', label: 'O‘quvchilar', numeric: true, render: (r) => fmt(r.oquvchilar) },
              { key: 'davlat_granti', label: 'Grant', numeric: true, render: (r) => fmt(r.davlat_granti) },
              { key: 'kontrakt', label: 'Kontrakt', numeric: true, render: (r) => fmt(r.kontrakt) },
              { key: 'qabul_kvota', label: 'Kvota 2025', numeric: true, render: (r) => fmt(r.qabul_kvota) },
              { key: 'pedagoglar', label: 'Pedagoglar', numeric: true },
              { key: 'vakant', label: 'Vakant', numeric: true },
              { key: 'kompyuterlar', label: 'Kompyuterlar', numeric: true },
              { key: 'simulyatsion', label: 'Sim. xona', numeric: true },
              { key: 'amaliy_baza', label: 'Amaliy baza', numeric: true },
            ]}
            rows={texStat}
            empty="Hudud ma‘lumotlari topilmadi"
            rowKey={(r) => r.hudud}
            renderExpanded={(r) => <HududBatafsil r={r} muassasalar={texMuassasalar} />}
            expandedKey={ochiqHudud}
            onExpandedChange={setOchiqHudud}
            totals={{
              hudud: `${texStat.length} hudud`,
              muassasa: `${fmt(texMuassasa)} (${texJami.davlat}D · ${texJami.nodavlat}N)`,
              oquvchilar: fmt(texJami.oquvchilar),
              davlat_granti: fmt(texJami.davlat_granti),
              kontrakt: fmt(texJami.kontrakt),
              qabul_kvota: fmt(texJami.qabul_kvota),
              pedagoglar: fmt(texJami.pedagoglar),
              vakant: fmt(texJami.vakant),
              kompyuterlar: fmt(texJami.kompyuterlar),
              simulyatsion: fmt(texJami.simulyatsion),
              amaliy_baza: fmt(texJami.amaliy_baza),
            }}
            footnote="Manba: texnikumlar anketa yig‘masi, 2026 (iyun–iyul). D — davlat, N — nodavlat muassasalar; anketa topshirmagan hududlar 0 bilan qatnashadi."
          />
        </Card>
      </div>
    </>
  );

  // ---- «Bakalavriat» bo'limi — TDTU kontingenti (docs/bakalavriat, 03.09.2026) ----
  const bak = useMemo(() => fakStat.filter((r) => r.talim_turi === 'Bakalavr'), [fakStat]);
  const bakJami = bak.reduce((a, r) => a + r.soni, 0);
  const bakAyol = bak.filter((r) => r.jinsi === 'ayol').reduce((a, r) => a + r.soni, 0);
  const bak1kurs = bak.filter((r) => r.kurs === 1).reduce((a, r) => a + r.soni, 0);
  const bakXalqaro = bak.filter((r) => r.fakultet === 'Xalqaro fakultet').reduce((a, r) => a + r.soni, 0);
  const ordJami = fakStat.filter((r) => r.talim_turi === 'Ordinatura').reduce((a, r) => a + r.soni, 0);
  const magJami = fakStat.filter((r) => r.talim_turi === 'Magistr').reduce((a, r) => a + r.soni, 0);
  const bakMutSoni = new Set(mutStat.filter((r) => r.talim_turi === 'Bakalavr').map((r) => r.mutaxassislik)).size;

  // Fakultet kesimi (bakalavr): jami, jins, 1..6-kurs
  const fakultetKesimi = useMemo(() => {
    const m = {};
    bak.forEach((r) => {
      const f = (m[r.fakultet] ||= { fakultet: r.fakultet, jami: 0, ayol: 0, erkak: 0, k1: 0, k2: 0, k3: 0, k4: 0, k5: 0, k6: 0 });
      f.jami += r.soni;
      f[r.jinsi] += r.soni;
      f[`k${r.kurs}`] += r.soni;
    });
    return Object.values(m).sort((a, b) => b.jami - a.jami);
  }, [bak]);

  // Kurs kesimi — ta'lim turi bo'yicha (butun TDTU kontingenti)
  const kursKesimi = useMemo(() => {
    const m = {};
    fakStat.forEach((r) => {
      const k = (m[r.kurs] ||= { kurs: `${r.kurs}-kurs`, n: r.kurs, Bakalavr: 0, Magistr: 0, Ordinatura: 0 });
      k[r.talim_turi] += r.soni;
    });
    return Object.values(m).sort((a, b) => a.n - b.n);
  }, [fakStat]);

  // Fakultet jadvali «Jami» qatori — ustunlar yig'indisi (bakJami bilan bir xil son)
  const fakJami = useMemo(
    () =>
      fakultetKesimi.reduce(
        (a, r) => {
          for (const k of Object.keys(a)) a[k] += r[k] || 0;
          return a;
        },
        { jami: 0, ayol: 0, k1: 0, k2: 0, k3: 0, k4: 0, k5: 0, k6: 0 }
      ),
    [fakultetKesimi]
  );

  const [ochiqFakultet, setOchiqFakultet] = useState(null);
  const fakJadvalRef = useRef(null);
  const fakultetniOch = (e) => {
    const f = e && e.activeLabel;
    if (!f) return;
    setOchiqFakultet(f);
    if (fakJadvalRef.current) fakJadvalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const bakalavrBolim = (
    <>
      <Card
        title="Toshkent davlat tibbiyot universiteti — bakalavriat kontingenti"
        subtitle={`rasmiy ro‘yxat · ${TALABA_MANBA_SANASI} holatiga`}
        extra={`${fakultetKesimi.length} fakultet`}
      >
        {/* Asosiy 4 ko'rsatkich — plitkalar; TDTU jami va login KPI chizig'ida */}
        <div className="grid stat-grid" style={{ marginBottom: 18 }}>
          <StatCard label="Bakalavr talabalar" value={fmt(bakJami)} icon="users" tone="primary" caption={`${foiz(bakAyol, bakJami)}% ayollar`} />
          <StatCard label="Fakultetlar" value={fakultetKesimi.length} icon="building" tone="success" caption={`${bakMutSoni} mutaxassislik`} />
          <StatCard label="1-kurs" value={fmt(bak1kurs)} icon="clipboard" tone="warning" caption="2025/26 qabul" />
          <StatCard label="Xalqaro fakultet" value={fmt(bakXalqaro)} icon="globe" tone="primary" caption={`bakalavriatning ${foiz(bakXalqaro, bakJami)}%`} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <KpiStrip
            items={[
              { key: 'tdtu', label: 'TDTU jami kontingent', value: fmt(tdtuJami), caption: 'bakalavr · magistr · ordinatura' },
              { key: 'ord', label: 'Klinik ordinatura', value: fmt(ordJami) },
              { key: 'mag', label: 'Magistratura', value: fmt(magJami) },
              { key: 'login', label: 'Login va parol berilgan', value: fmt(tdtuJami) },
            ]}
          />
        </div>

        <div className="grid cols-2" style={{ gap: 24, marginBottom: 8, alignItems: 'start' }}>
          <div>
            <GrafikSarlavha izoh="fakultetni bosing — jadvalda ochiladi">Bakalavr talabalar — fakultet va jins kesimida</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={fakultetKesimi}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8 }}
                onClick={fakultetniOch}
                style={{ cursor: 'pointer' }}
              >
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="fakultet" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)} />
                <Tooltip contentStyle={chartTip} formatter={(v, n) => [fmt(v), n]} cursor={cursorFill} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="ayol" name="Ayollar" stackId="j" fill={chartColors[0]} barSize={13} isAnimationActive={false} />
                <Bar dataKey="erkak" name="Erkaklar" stackId="j" fill={chartColors[1]} radius={[0, 4, 4, 0]} barSize={13} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <GrafikSarlavha izoh="bakalavr · magistr · ordinatura">TDTU kontingenti — kurs va ta‘lim turi kesimida</GrafikSarlavha>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={kursKesimi} margin={{ top: 4, right: 16, left: 8 }} barGap={2}>
                <XAxis dataKey="kurs" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTip} formatter={(v, n) => [fmt(v), n]} cursor={cursorFill} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} iconType="circle" />
                <Bar dataKey="Bakalavr" name="Bakalavr" stackId="t" fill={chartColors[0]} barSize={34} isAnimationActive={false} />
                <Bar dataKey="Magistr" name="Magistr" stackId="t" fill={chartColors[1]} barSize={34} isAnimationActive={false} />
                <Bar dataKey="Ordinatura" name="Klinik ordinatura" stackId="t" fill={chartColors[2]} radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Qo'shimcha kesimlar: mutaxassisliklar, kurslar, issiqlik xaritasi, jins ulushi */}
      <div style={{ marginTop: 24 }}>
        <BakalavrGrafiklar fakStat={fakStat} mutStat={mutStat} />
      </div>

      <div style={{ marginTop: 24 }} ref={fakJadvalRef}>
        <Card title="Fakultet kesimida to‘liq ko‘rsatkichlar (bakalavriat)" subtitle="qatorni bosing — mutaxassisliklar ochiladi" extra={`${fakultetKesimi.length} fakultet`}>
          <DataTable
            searchable
            numbered
            columns={[
              { key: 'fakultet', label: 'Fakultet', rowHeader: true },
              { key: 'jami', label: 'Talabalar', numeric: true, render: (r) => fmt(r.jami) },
              { key: 'ayol', label: 'Ayollar', numeric: true, render: (r) => `${fmt(r.ayol)} (${foiz(r.ayol, r.jami)}%)` },
              { key: 'k1', label: '1-kurs', numeric: true, render: (r) => fmt(r.k1) },
              { key: 'k2', label: '2-kurs', numeric: true, render: (r) => fmt(r.k2) },
              { key: 'k3', label: '3-kurs', numeric: true, render: (r) => fmt(r.k3) },
              { key: 'k4', label: '4-kurs', numeric: true, render: (r) => fmt(r.k4) },
              { key: 'k5', label: '5-kurs', numeric: true, render: (r) => fmt(r.k5) },
              { key: 'k6', label: '6-kurs', numeric: true, render: (r) => fmt(r.k6) },
            ]}
            rows={fakultetKesimi}
            empty="Fakultet ma‘lumotlari topilmadi"
            rowKey={(r) => r.fakultet}
            renderExpanded={(r) => <FakultetBatafsil r={r} mutStat={mutStat} />}
            expandedKey={ochiqFakultet}
            onExpandedChange={setOchiqFakultet}
            totals={{
              fakultet: `${fakultetKesimi.length} fakultet`,
              jami: fmt(fakJami.jami),
              ayol: `${fmt(fakJami.ayol)} (${foiz(fakJami.ayol, fakJami.jami)}%)`,
              k1: fmt(fakJami.k1),
              k2: fmt(fakJami.k2),
              k3: fmt(fakJami.k3),
              k4: fmt(fakJami.k4),
              k5: fmt(fakJami.k5),
              k6: fmt(fakJami.k6),
            }}
            footnote={`Manba: TDTU talabalar ro‘yxati, ${TALABA_MANBA_SANASI} holatiga (bakalavriat). Ayollar ulushi — fakultet jami talabalariga nisbatan.`}
          />
        </Card>
      </div>
    </>
  );

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Tahlil paneli' }]}
        title="Tahliliy boshqaruv markazi"
        subtitle="Tibbiy ta'lim, mutaxassislar taqsimoti va uzluksiz malaka monitoringi"
        meta={MALUMOT_META}
      />

      {/* Bo'lim tugmalari — har yo'nalish statistikasi alohida tabda (sahifa ortiqcha uzayib ketmasligi uchun) */}
      <TabGroup
        variant="underline"
        tabs={[
          { key: 'umumiy', label: 'Umumiy ko‘rinish', element: umumiyBolim },
          { key: 'texnikum', label: 'Texnikumlar', element: texnikumBolim },
          { key: 'bakalavr', label: 'Bakalavriat', element: bakalavrBolim },
          {
            key: 'magistr',
            label: 'Magistratura',
            element: (
              <MagistrBolim
                fakStat={fakStat}
                mutStat={mutStat}
                magStat={magStat}
                magMutStat={magMutStat}
                yoshStat={yoshStat}
                yonalishlar={yonalishlar}
              />
            ),
          },
          {
            key: 'doktorant',
            label: 'Doktorantura',
            element: <DoktorantBolim dokStat={dokStat} rahbarStat={rahbarStat} yonalishlar={yonalishlar} />,
          },
          {
            key: 'jihoz',
            label: 'Tibbiy jihozlar',
            element: (
              <JihozBolim hududStat={jihozHudud} tumanStat={jihozTuman} turiStat={jihozTuri} muassasalar={jihozMuassasa} />
            ),
          },
        ]}
      />
    </>
  );
}
