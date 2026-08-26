'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import UzMap from '../../components/UzMap';
import { PageHead, Card, StatCard, Badge, DataTable } from '../../components/ui.jsx';
import Icon from '../../components/icons.jsx';
import { getProfiles, getBarchaLitsenziyalar } from '../../lib/data-service';
import { theme, chartTip, chartColors, chartGray } from '../../lib/theme.js';

const STAGE_LABELS = {
  chuqurlashtirilgan_sinf: 'Chuqur. sinf',
  texnikum: 'Texnikum',
  bakalavr: 'Bakalavriat',
  magistr: 'Magistratura',
  rezidentura: 'Rezidentura',
  doktor: 'Shifokor (Doktor)',
  doktarantura: 'Doktarantura',
};

const axisStyle = { fontSize: 11, fill: theme.muted };

export default function DashboardPage() {
  const [profiles, setProfiles] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedStage, setSelectedStage] = useState('all');

  useEffect(() => {
    (async () => {
      const [prof, lic] = await Promise.all([getProfiles(), getBarchaLitsenziyalar()]);
      setProfiles(prof);
      setLicenses(lic);
    })();
  }, []);

  // Filtrlangan reyestr (hudud + bosqich)
  const filteredProfiles = useMemo(
    () =>
      profiles
        .filter((p) => {
          const matchRegion = !selectedRegion || p.manzil_viloyat_id === selectedRegion;
          const matchStage = selectedStage === 'all' || p.hozirgi_bosqich === selectedStage;
          return matchRegion && matchStage;
        })
        .map((p) => ({
          ...p,
          bosqich_nomi: STAGE_LABELS[p.hozirgi_bosqich] || p.hozirgi_bosqich,
          hudud: `${(p.manzil_viloyat_id || '').replace('-', ' ')}${p.manzil_tuman ? ` · ${p.manzil_tuman}` : ''}`,
          ish: p.ish_joyi || '—',
        })),
    [profiles, selectedRegion, selectedStage]
  );

  // Xarita uchun hudud kesimi
  const regionStats = useMemo(() => {
    const stats = {};
    profiles.forEach((p) => {
      const reg = p.manzil_viloyat_id || 'boshqa';
      stats[reg] = (stats[reg] || 0) + 1;
    });
    return stats;
  }, [profiles]);

  // Bosqichlar taqsimoti (grafik)
  const stageChartData = useMemo(() => {
    const counts = {};
    profiles.forEach((p) => {
      const stage = p.hozirgi_bosqich || 'bakalavr';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.keys(STAGE_LABELS).map((k) => ({
      name: STAGE_LABELS[k],
      soni: counts[k] || 0,
    }));
  }, [profiles]);

  const talimda = profiles.filter((p) =>
    ['bakalavr', 'magistr', 'rezidentura', 'doktarantura'].includes(p.hozirgi_bosqich)
  ).length;
  const shifokorlar = profiles.filter((p) => p.hozirgi_bosqich === 'doktor').length;
  const tugayotgan = licenses.filter((l) => l.holati === 'muddati_tugayapti').length;

  // CSV eksport
  const exportToCSV = () => {
    const headers = ['ID', 'F.I.O', 'JSHSHIR', 'Bosqich', 'Viloyat', 'Tuman', 'Ish joyi', 'Lavozimi'];
    const rows = filteredProfiles.map((p) => [
      p.id,
      `"${p.fish}"`,
      p.jshshir,
      p.bosqich_nomi,
      p.manzil_viloyat_id,
      `"${p.manzil_tuman || ''}"`,
      `"${p.ish_joyi || ''}"`,
      `"${p.lavozimi || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ETTP_Xodimlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: 'fish', label: 'F.I.O' },
    { key: 'jshshir', label: 'JSHSHIR', mono: true },
    { key: 'bosqich_nomi', label: 'Joriy bosqich', render: (r) => <Badge tone="info">{r.bosqich_nomi}</Badge> },
    { key: 'hudud', label: 'Hudud' },
    { key: 'ish', label: 'Ish joyi' },
    { key: 'lavozimi', label: 'Lavozimi' },
  ];

  return (
    <>
      <PageHead
        title="Tahliliy boshqaruv markazi"
        subtitle="Tibbiy ta'lim, mutaxassislar taqsimoti va uzluksiz malaka monitoringi"
      />

      {/* Asosiy KPI'lar */}
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Jami xodimlar" value={profiles.length} icon="users" tone="primary" />
        <StatCard label="Ta'lim olmoqda" value={talimda} icon="book" tone="warning" />
        <StatCard label="Amaliyotchi shifokorlar" value={shifokorlar} icon="award" tone="success" />
        <StatCard label="Litsenziyasi tugayotgan" value={tugayotgan} icon="alert" tone="accent" />
      </div>

      {/* GIS xarita + bosqichlar grafigi */}
      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        <UzMap regionStats={regionStats} selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />

        <Card title="Ta'lim bosqichlari bo'yicha taqsimot" extra="Uzluksiz ta'lim zanjiri">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stageChartData} layout="vertical" margin={{ top: 8, right: 20, left: 30, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={110} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTip} cursor={{ fill: 'rgba(17,24,39,0.04)' }} />
              <Bar dataKey="soni" name="Xodimlar soni" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false}>
                {stageChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length] || chartGray} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Milliy reyestr jadvali */}
      <Card
        title="Tibbiyot xodimlari milliy reyestri"
        extra={`${filteredProfiles.length} nafar ko‘rsatilmoqda`}
      >
        <div className="tbl-toolbar" style={{ marginBottom: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="select" style={{ maxWidth: 220 }} value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
            <option value="all">Barcha bosqichlar</option>
            {Object.keys(STAGE_LABELS).map((k) => (
              <option key={k} value={k}>{STAGE_LABELS[k]}</option>
            ))}
          </select>
          <button className="btn btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={exportToCSV}>
            <Icon.download width={15} height={15} /> CSV yuklab olish
          </button>
        </div>
        <DataTable searchable numbered columns={columns} rows={filteredProfiles} empty="Tanlangan filtr bo‘yicha xodim topilmadi" />
      </Card>
    </>
  );
}
