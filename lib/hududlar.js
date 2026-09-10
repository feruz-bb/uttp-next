// Xarita (UzMap) hudud id'lari ↔ statistik yig'malardagi qisqa hudud nomlari.
// texnikum_hudud_stat, jihoz_muassasa va boshqa hudud kesimli jadvallar shu nomlarni ishlatadi
// (scripts/gen_*.py generatorlari ham). Uzun rasmiy nomlar — components/ui.jsx HUDUDLAR.
export const HUDUD_ID = {
  qoraqalpogiston: 'Qoraqalpog‘iston',
  andijon: 'Andijon',
  buxoro: 'Buxoro',
  jizzax: 'Jizzax',
  qashqadaryo: 'Qashqadaryo',
  navoiy: 'Navoiy',
  namangan: 'Namangan',
  samarqand: 'Samarqand',
  surxondaryo: 'Surxondaryo',
  sirdaryo: 'Sirdaryo',
  fargona: 'Farg‘ona',
  xorazm: 'Xorazm',
  'toshkent-shahar': 'Toshkent sh.',
  'toshkent-viloyat': 'Toshkent vil.',
};

// Nomni taqqoslash kaliti — apostrof turi (‘ ’ ' ʻ) va registr farqiga sezgir emas (Supabase yozuvlari uchun)
export const hududKaliti = (nom) => String(nom || '').toLowerCase().replace(/[‘’'ʻ`]/g, '');

export const HUDUD_NOMDAN_ID = Object.fromEntries(Object.entries(HUDUD_ID).map(([id, nom]) => [hududKaliti(nom), id]));

// Hudud nomi → xarita id'si (topilmasa null)
export const hududIdsi = (nom) => HUDUD_NOMDAN_ID[hududKaliti(nom)] || null;

// Jihozlar yig'masida hududi ko'rsatilmagan yozuvlar guruhi (scripts/gen_jihozlar.py KORSATILMAGAN bilan bir xil)
export const JIHOZ_KORSATILMAGAN = 'Ko‘rsatilmagan';
