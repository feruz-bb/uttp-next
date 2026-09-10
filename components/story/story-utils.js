// Story-e'lonlar uchun umumiy yordamchilar (rang tokenlari, tur yorliqlari, formatlar).

// Muqova rangi — dizayn tizimi tokenlari (yassi, gradientsiz)
// CSS'da ba'zi tokenlar boshqa nom bilan (--teal yo'q) — fallback hex lib/theme.js bilan bir xil
export const RANG_TOKEN = {
  primary: 'var(--primary, #06b6d4)',
  teal: 'var(--teal, #1fa396)',
  violet: 'var(--violet, #7c3aed)',
  navy: 'var(--navy, #111827)',
  success: 'var(--success, #16a34a)',
  accent: 'var(--accent, #e4756a)',
};
export const RANGLAR = Object.keys(RANG_TOKEN);
export const RANG_NOMI = {
  primary: 'Turkuaz', teal: 'Teal', violet: 'Binafsha', navy: 'To‘q ko‘k', success: 'Yashil', accent: 'Marjon',
};

export const TURI_NOMI = { grant: 'Grant loyihasi', innovatsiya: 'Innovatsiya', elon: 'E‘lon' };
export const TURI_IKON = { grant: 'flask', innovatsiya: 'award', elon: 'megaphone' };
export const TURI_TONE = { grant: 'teal', innovatsiya: 'violet', elon: 'info' };

export const BOSQICH_TONE = { yakunlangan: 'success', 'davom etmoqda': 'warning', rejalashtirilgan: 'info' };

// 1 879 673 000 → «1,88 mlrd so‘m»
export function qiymatMatn(n) {
  const v = Number(n);
  if (!v) return null;
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} mlrd so‘m`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} mln so‘m`;
  return `${v.toLocaleString('ru-RU')} so‘m`;
}

// ISO sana → «3 soat oldin» / «2 kun oldin» / «12.05.2026»
export function vaqtOldin(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const farq = Math.max(0, Date.now() - t);
  const daq = Math.floor(farq / 60000);
  if (daq < 1) return 'hozir';
  if (daq < 60) return `${daq} daqiqa oldin`;
  const soat = Math.floor(daq / 60);
  if (soat < 24) return `${soat} soat oldin`;
  const kun = Math.floor(soat / 24);
  if (kun < 7) return `${kun} kun oldin`;
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function sanaVaqt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('ru-RU')} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

// Faol e'lonmi (holat + muddat)
export function faolmi(e) {
  if (!e || e.holat !== 'faol') return false;
  const hozir = Date.now();
  if (e.boshlanish && new Date(e.boshlanish).getTime() > hozir) return false;
  if (e.tugash && new Date(e.tugash).getTime() <= hozir) return false;
  return true;
}

// Rol e'lon joylay oladimi (sozlamalar bo'yicha)
export function qoshaOladimi(rol, sozlamalar) {
  const ruxsat = sozlamalar?.story_kim_qosha_oladi;
  const royxat = Array.isArray(ruxsat) ? ruxsat : ['admin', 'vazirlik'];
  return royxat.includes(rol);
}
