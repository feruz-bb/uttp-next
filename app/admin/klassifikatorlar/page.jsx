'use client';

import React, { useState, useEffect } from 'react';
import { PageHead, Card, Badge, DataTable } from '../../../components/ui.jsx';
import { getYonalishlar } from '../../../lib/data-service';

// Supabase ulanmagan holat uchun qisqartirilgan fallback ro'yxat
const FALLBACK = [
  { kodi: '60910100', nomi: 'Stomatologiya', bosqich: 'bakalavriat' },
  { kodi: '60910200', nomi: 'Davolash ishi (Umumiy tibbiyot)', bosqich: 'bakalavriat' },
  { kodi: '60910300', nomi: 'Pediatriya ishi', bosqich: 'bakalavriat' },
  { kodi: '60911200', nomi: 'Oliy hamshiralik ishi (OMH)', bosqich: 'bakalavriat' },
  { kodi: '70910201', nomi: 'Kardiologiya', bosqich: 'magistratura' },
  { kodi: '70910218', nomi: 'Pediatriya', bosqich: 'magistratura' },
  { kodi: '70910220', nomi: 'Umumiy xirurgiya', bosqich: 'magistratura' },
  { kodi: '14.00.06', nomi: 'Kardiologiya', bosqich: 'doktarantura' },
  { kodi: '14.00.33', nomi: 'Jamoat salomatligi va sog‘liqni saqlashni boshqarish', bosqich: 'doktarantura' },
];

const TABLAR = [
  { key: 'texnikum', label: 'Texnikum (509…)' },
  { key: 'bakalavriat', label: 'Bakalavriat (609…)' },
  { key: 'magistratura', label: 'Magistratura (709…)' },
  { key: 'doktarantura', label: 'OAK Doktarantura (14.00.xx)' },
];

const BOSQICH_NOMI = {
  texnikum: 'Texnikum',
  bakalavriat: 'Bakalavriat',
  magistratura: 'Magistratura',
  doktarantura: 'Doktarantura',
};

const columns = [
  { key: 'kodi', label: 'Klassifikator kodi', mono: true },
  { key: 'nomi', label: 'Mutaxassislik nomi' },
  { key: 'bosqich_nomi', label: 'Ta‘lim bosqichi' },
  { key: 'holati', label: 'Holati', render: () => <Badge tone="success">Faol</Badge> },
];

export default function AdminKlassifikatorlarPage() {
  const [yonalishlar, setYonalishlar] = useState([]);
  const [activeTab, setActiveTab] = useState('bakalavriat');

  useEffect(() => {
    getYonalishlar().then((data) => setYonalishlar(data.length ? data : FALLBACK));
  }, []);

  const rows = yonalishlar
    .filter((y) => y.bosqich === activeTab)
    .map((y) => ({ ...y, id: y.kodi, bosqich_nomi: BOSQICH_NOMI[y.bosqich] || y.bosqich }));

  return (
    <>
      <PageHead
        title="Mutaxassislik va yo'nalishlar klassifikatori"
        subtitle="Uzluksiz ta'lim zanjiridagi rasmiy shifrlar va ixtisoslik kodlari reyestri"
      />

      <div className="tabs" style={{ marginBottom: 18 }}>
        {TABLAR.map((t) => (
          <button
            key={t.key}
            className={`tab ${t.key === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card title={BOSQICH_NOMI[activeTab]} extra={`${rows.length} ta yo'nalish`}>
        <DataTable
          searchable
          numbered
          columns={columns}
          rows={rows}
          empty="Bu bosqich uchun yo'nalishlar topilmadi"
        />
      </Card>
    </>
  );
}
