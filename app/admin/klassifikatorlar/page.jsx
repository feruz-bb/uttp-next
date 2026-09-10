'use client';

import { useState, useEffect } from 'react';
import { PageHead, Card, DataTable } from '../../../components/ui.jsx';
import { getYonalishlar } from '../../../lib/data-service';

// Supabase ulanmagan holat uchun qisqartirilgan fallback ro'yxat
const FALLBACK = [
  { kodi: '40910206', nomi: 'Tibbiyot brigadasi hamshirasi', bosqich: 'texnikum' },
  { kodi: '40910302', nomi: 'Tibbiy profilaktika ishi', bosqich: 'texnikum' },
  { kodi: '50910102', nomi: 'Stomatologiya ishi', bosqich: 'texnikum' },
  { kodi: '50910203', nomi: 'Hamshiralik ishi', bosqich: 'texnikum' },
  { kodi: '50910204', nomi: 'Davolash ishi (feldsherlik)', bosqich: 'texnikum' },
  { kodi: '50910205', nomi: 'Funksional diagnostika ishi', bosqich: 'texnikum' },
  { kodi: '50910401', nomi: 'Farmatsiya', bosqich: 'texnikum' },
  { kodi: '60910100', nomi: 'Stomatologiya', bosqich: 'bakalavriat' },
  { kodi: '60910200', nomi: 'Davolash ishi (Umumiy tibbiyot)', bosqich: 'bakalavriat' },
  { kodi: '60910300', nomi: 'Pediatriya ishi', bosqich: 'bakalavriat' },
  { kodi: '60911200', nomi: 'Oliy hamshiralik ishi (OMH)', bosqich: 'bakalavriat' },
  { kodi: '70910205', nomi: 'Kardiologiya', bosqich: 'magistratura' },
  { kodi: '70910301', nomi: 'Pediatriya', bosqich: 'magistratura' },
  { kodi: '70910212', nomi: 'Xirurgiya', bosqich: 'magistratura' },
  { kodi: '14.00.06', nomi: 'Kardiologiya', bosqich: 'doktorantura' },
  { kodi: '14.00.33', nomi: 'Jamoat salomatligi va sog‘liqni saqlashni boshqarish', bosqich: 'doktorantura' },
];

// Tab yorliqlarida shifr prefiksi yo'q — jonli klassifikatorda 705…/709… va 03.00.xx/13.00.xx/19.00.xx ham bor
const TABLAR = [
  { key: 'texnikum', label: 'Texnikum' },
  { key: 'bakalavriat', label: 'Bakalavriat' },
  { key: 'magistratura', label: 'Magistratura' },
  { key: 'doktorantura', label: 'Doktorantura (OAK shifrlari)' },
];

const BOSQICH_NOMI = {
  texnikum: 'Texnikum',
  bakalavriat: 'Bakalavriat',
  magistratura: 'Magistratura',
  doktorantura: 'Doktorantura',
};

// Bosqich ustuni yo'q — karta sarlavhasi (faol tab) uni aytadi; «Faol» doimiy ustuni ham olib tashlandi
const columns = [
  { key: 'kodi', label: 'Klassifikator kodi', mono: true },
  { key: 'nomi', label: 'Mutaxassislik nomi', rowHeader: true },
];

export default function AdminKlassifikatorlarPage() {
  const [yonalishlar, setYonalishlar] = useState([]);
  const [activeTab, setActiveTab] = useState('bakalavriat');

  useEffect(() => {
    getYonalishlar().then((data) => setYonalishlar(data.length ? data : FALLBACK));
  }, []);

  const rows = yonalishlar
    .filter((y) => y.bosqich === activeTab)
    .map((y) => ({ ...y, id: y.kodi }));

  return (
    <>
      <PageHead
        breadcrumb={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Klassifikatorlar' }]}
        title="Mutaxassislik va yo‘nalishlar klassifikatori"
        count={yonalishlar.length || undefined}
        subtitle="Uzluksiz ta‘lim zanjiridagi rasmiy shifrlar va ixtisoslik kodlari reyestri"
      />

      {/* Bosqich almashtirgich — TabGroup'ning underline varianti bilan bir xil belgilash (holat lokal) */}
      <div className="tabs tabs--underline" role="tablist">
        {TABLAR.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === activeTab}
            className={`tab ${t.key === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card title={BOSQICH_NOMI[activeTab]} extra={`${rows.length} ta yo‘nalish`}>
        <DataTable
          searchable
          numbered
          columns={columns}
          rows={rows}
          pageSize={25}
          footnote="Manba: Oliy ta‘lim yo‘nalishlari va mutaxassisliklari klassifikatori; OAK ixtisosliklar nomenklaturasi."
          empty="Bu bosqich uchun yo‘nalishlar topilmadi"
        />
      </Card>
    </>
  );
}
