// Ochiq (auth'siz) sahifalar — login — uchun rasmiy bosh raqamlar.
// Dashboard bu raqamlarni Supabase jadvallaridan hisoblaydi; login'da RLS sabab o'qib bo'lmaydi,
// shuning uchun statik nusxa. Yangi manba yuklanganda qo'lda yangilanadi (sana ham).
//
// Manbalar (2026-yil sentabr holatiga):
//   o'qiyotganlar 65 058 = texnikum anketasi 36 936 + TDTU ro'yxati (03.09.2026) 27 739 + doktorantura (04.09.2026) 383
//   tibbiyot muassasalari 3 875 va tibbiy jihozlar 272 578 — docs/equipment_summary.xlsx (jihoz_muassasa)
//   texnikumlar 125 — texnikum anketasi 2026 (74 davlat + 51 xususiy)
export const RASMIY_RAQAMLAR = {
  oqiyotganlar: 65058,
  tibbiyot_muassasalari: 3875,
  tibbiy_jihozlar: 272578,
  texnikumlar: 125,
  sana: '2026-yil sentabr holatiga',
};
