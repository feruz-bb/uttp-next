'use client';

import { useMemo, useState } from 'react';
import Uzbekistan from '@svg-maps/uzbekistan';

// @svg-maps/uzbekistan haqiqiy id'lari → bizning bazadagi region id'lar.
// Diqqat: paketda Toshkent shahri va viloyati BIR XIL id ("tashkent") bilan
// keladi — ularni kontur (path) uzunligidan ajratamiz: kalta kontur = shahar.
const REGION_MAP = {
  karakalpakstan: { id: 'qoraqalpogiston', nom: 'Qoraqalpog‘iston' },
  andijan: { id: 'andijon', nom: 'Andijon' },
  bukhara: { id: 'buxoro', nom: 'Buxoro' },
  jizzakh: { id: 'jizzax', nom: 'Jizzax' },
  qashqadaryo: { id: 'qashqadaryo', nom: 'Qashqadaryo' },
  navoiy: { id: 'navoiy', nom: 'Navoiy' },
  namangan: { id: 'namangan', nom: 'Namangan' },
  samarqand: { id: 'samarqand', nom: 'Samarqand' },
  surxondaryo: { id: 'surxondaryo', nom: 'Surxondaryo' },
  sirdaryo: { id: 'sirdaryo', nom: 'Sirdaryo' },
  fergana: { id: 'fargona', nom: 'Farg‘ona' },
  xorazm: { id: 'xorazm', nom: 'Xorazm' },
};

// Tooltip uchun: bazadagi region id → ko'rsatiladigan nom
const REGION_NOMLARI = {
  ...Object.fromEntries(Object.values(REGION_MAP).map((r) => [r.id, r.nom])),
  'toshkent-shahar': 'Toshkent sh.',
  'toshkent-viloyat': 'Toshkent vil.',
};

// Xarita lokatsiyasini bazadagi regionga bog'laydi ("aral-sea" uchun null)
function regionInfo(loc) {
  if (loc.id === 'tashkent') {
    return loc.path.length < 1500
      ? { id: 'toshkent-shahar', nom: 'Toshkent sh.' }
      : { id: 'toshkent-viloyat', nom: 'Toshkent vil.' };
  }
  return REGION_MAP[loc.id] || null;
}

export default function UzMap({
  regionStats = {},
  selectedRegion,
  onSelectRegion,
  title = 'Hududlar bo‘yicha taqsimot',
  subtitle = 'Filtrlash uchun viloyat ustiga bosing',
  birlik = 'nafar',
}) {
  const [hovered, setHovered] = useState(null); // regionInfo.id saqlanadi

  // Sekvensial turquoise rampa (dizayn tizimi: #d5edea → #0f6b62) — eng katta hududga nisbatan 4 pog'ona
  const maks = useMemo(() => Math.max(0, ...Object.values(regionStats).map((v) => Number(v) || 0)), [regionStats]);
  const getColor = (count, isSelected) => {
    if (isSelected) return 'var(--primary, #06b6d4)';
    if (!count || count === 0 || !maks) return '#dfe4eb';
    const ulush = count / maks;
    if (ulush > 0.6) return '#0f6b62';
    if (ulush > 0.35) return '#2e9186';
    if (ulush > 0.15) return '#5fb5aa';
    return '#9fd3cc';
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="card__head">
        <h3>{title}</h3>
        <div className="card__head-right">
          {selectedRegion ? (
            <button className="btn btn--ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onSelectRegion(null)}>
              Filtrni bekor qilish ✕
            </button>
          ) : (
            <span>{subtitle}</span>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={Uzbekistan.viewBox}
          style={{ width: '100%', height: '100%', maxHeight: '320px' }}
        >
          {Uzbekistan.locations.map((loc, i) => {
            const regInfo = regionInfo(loc);
            // Orol dengizi kabi region bo'lmagan konturlar — interaktiv emas
            if (!regInfo) {
              return (
                <path key={`${loc.id}-${i}`} d={loc.path} fill="#eef2f6" stroke="#ffffff" strokeWidth="1.5" />
              );
            }
            const count = regionStats[regInfo.id] || 0;
            const isSelected = selectedRegion === regInfo.id;

            return (
              <path
                key={regInfo.id}
                d={loc.path}
                fill={getColor(count, isSelected)}
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: hovered === regInfo.id ? 0.85 : 1,
                  filter: isSelected ? 'drop-shadow(0 2px 6px rgba(6, 182, 212, 0.4))' : 'none',
                }}
                onMouseEnter={() => setHovered(regInfo.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectRegion(selectedRegion === regInfo.id ? null : regInfo.id)}
              />
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <strong>{REGION_NOMLARI[hovered] || hovered}</strong>: {(regionStats[hovered] || 0).toLocaleString('ru-RU')} {birlik}
        </div>
      )}
    </div>
  );
}
