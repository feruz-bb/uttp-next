// Demo hisoblar ro'yxati — seed.sql bilan sinxron saqlanadi.
// Parol konvensiyasi: <ism>2026. Login sahifasidagi tezkor kirish shundan o'qiydi.

// Namuna talaba/doktorant hisoblari — kichik literal modul (katta *-fallback.js'lar login'ga yuklanmaydi)
import { DEMO_TALABALAR as DEMO_TALABA_NAMUNA, DEMO_DOKTORANTLAR } from './demo-namunalar';

export const DEMO_ROLLAR = [
  { email: 'vazirlik@ssv.uz', parol: 'vazirlik2026', nom: 'Vazirlik / Tahlil paneli', tavsif: 'Umumiy monitoring va statistika', ikon: 'fa-landmark' },
  { email: 'admin@ssv.uz', parol: 'admin2026', nom: 'Super admin / Boshqaruv', tavsif: 'CRUD va klassifikatorlar', ikon: 'fa-user-shield' },
];

// Ta'lim zanjirining har bosqichidan bittadan xodim (Canvas 2-yo'nalish demosi)
export const DEMO_XODIMLAR = [
  { email: 'madina.y@ssv.uz', parol: 'madina2026', ism: 'Yusupova Madina', bosqich: 'Chuqurlashtirilgan sinf o‘quvchisi', bosqichId: 'chuqurlashtirilgan_sinf' },
  { email: 'aziz.q@ssv.uz', parol: 'aziz2026', ism: 'Qodirov Aziz', bosqich: 'Texnikum talabasi', bosqichId: 'texnikum' },
  { email: 'nilufar.e@ssv.uz', parol: 'nilufar2026', ism: 'Ergasheva Nilufar', bosqich: 'Bakalavriat talabasi (3-kurs)', bosqichId: 'bakalavr' },
  { email: 'shahlo.k@ssv.uz', parol: 'shahlo2026', ism: 'Karimova Shahlo', bosqich: 'Magistratura (2-kurs)', bosqichId: 'magistr' },
  { email: 'sardor.t@ssv.uz', parol: 'sardor2026', ism: 'Tursunov Sardor', bosqich: 'Klinik ordinatura (rezidentura)', bosqichId: 'rezidentura' },
  { email: 'jamshid.r@ssv.uz', parol: 'jamshid2026', ism: 'Rahimov Jamshid', bosqich: 'Doktor (amaliyotchi shifokor)', bosqichId: 'doktor' },
  { email: 'gulnora.m@ssv.uz', parol: 'gulnora2026', ism: 'Mirzayeva Gulnora', bosqich: 'Doktorantura (PhD)', bosqichId: 'doktorantura' },
];

// TDTU real ro'yxatidan namuna talabalar va doktorantlar (demo-namunalar.js seed_*.sql bilan sinxron)
export const DEMO_TALABALAR = [...DEMO_TALABA_NAMUNA, ...DEMO_DOKTORANTLAR];

export const DEMO_PAROLLAR = Object.fromEntries(
  [...DEMO_ROLLAR, ...DEMO_XODIMLAR, ...DEMO_TALABALAR].map((h) => [h.email, h.parol])
);
