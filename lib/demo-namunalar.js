// Login demosi uchun namuna talaba/doktorant hisoblari — KICHIK literal ro'yxat.
// Ilgari lib/talaba-fallback.js va lib/doktorant-fallback.js (jami ~170 KB, generatsiya
// qilingan agregatlar) dan import qilinardi — endi /login o'sha katta modullarni bundle'ga olmaydi.
//
// SINXRONLIK: bu yozuvlar scripts/gen_talaba.py (namuna = [...], 4 ta) va
// scripts/gen_doktorant.py (namuna = [...], 2 ta) ro'yxatlaridan nusxa — generatorlar
// qayta ishga tushirilib namuna o'zgarsa, DEMO_TALABALAR/DEMO_DOKTORANTLAR eksportlari
// (lib/*-fallback.js oxirida) bilan solishtirib bu faylni ham yangilang.
// Maydonlar fallback modullaridagi bilan bir xil: email, parol, ism, bosqich, bosqichId, kurs.
// Parol konvensiyasi: <ism>2026 (seed_talaba.sql / seed_doktorant.sql bilan sinxron).

// Ro'yxat sanalari — TDTU kontingent ro'yxati (talaba) va doktorantlar ro'yxati.
// SINXRONLIK: scripts/gen_talaba.py / scripts/gen_doktorant.py dagi MANBA_SANASI bilan bir xil —
// generatorlar bu faylni o'qib tekshiradi (sana o'zgarsa assertion bilan to'xtaydi).
// Shu yerda turishi sababi: components/TalabaProfil.jsx va app/dashboard/page.jsx faqat ikki sana
// satri uchun ~170 KB li lib/*-fallback.js modullarini bundle'ga tortmasin (ular data-service'da
// faqat zaxira tarmog'ida `await import()` bilan yuklanadi).
export const TALABA_MANBA_SANASI = '2026-09-03';
export const DOKTORANT_MANBA_SANASI = '2026-09-04';

export const DEMO_TALABALAR = [
  { email: 'shukrullayev.azizbek@talaba.tdtu.uz', parol: 'azizbek2026', ism: 'Shukrullayev Azizbek Shuhrat O‘g‘li', bosqich: 'Bakalavr 1-kurs · 1-Davolash fakulteti', bosqichId: 'bakalavr', kurs: 1 },
  { email: 'materova.ayna@talaba.tdtu.uz', parol: 'ayna2026', ism: 'Materova Ayna Ismailovna', bosqich: 'Bakalavr 6-kurs · 1-Davolash fakulteti', bosqichId: 'bakalavr', kurs: 6 },
  { email: 'sadullayeva.shamsiyabonu@talaba.tdtu.uz', parol: 'shamsiyabonu2026', ism: 'Sa’dullayeva Shamsiyabonu Muxiddin Qizi', bosqich: 'Magistr 2-kurs · Magistratura (Mahalliy)', bosqichId: 'magistr', kurs: 2 },
  { email: 'xamrayev.orifxon@talaba.tdtu.uz', parol: 'orifxon2026', ism: 'Xamrayev Orifxon Sunatulla O‘g‘li', bosqich: 'Ordinatura 1-kurs · Klinik ordinatura', bosqichId: 'rezidentura', kurs: 1 },
];

export const DEMO_DOKTORANTLAR = [
  { email: 'usmonaliyeva.zilola@doktorant.tdtu.uz', parol: 'zilola2026', ism: 'Usmonaliyeva Zilola Axmadjon Qizi', bosqich: 'Tayanch doktorantura, PhD · Morfologiya', bosqichId: 'doktorantura', kurs: 1 },
  { email: 'abduvaxitova.asal@doktorant.tdtu.uz', parol: 'asal2026', ism: 'Abduvaxitova Asal Nabiyevna', bosqich: 'Doktorantura, DSc · Ichki kasalliklar', bosqichId: 'doktorantura', kurs: 1 },
];
