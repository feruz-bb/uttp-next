import { createClient } from './supabase/client';
import { INITIAL_ELONLAR } from './elonlar-fallback';

// =========================================================
// Zaxira (fallback) holati — qaysi getter INITIAL_* ma'lumotga tushganini
// belgilaydigan kichik modul-darajali do'kon. Getter'lar qaytaradigan shakl
// o'zgarmaydi; faqat yonaki belgi qo'yiladi.
// TODO(shell): KabinetShell «Zaxira ma’lumot» belgisini
// useSyncExternalStore(zaxiraKuzat, zaxiraHolati, () => zaxiraHolati())
// bilan chizadi — bu modul holatni beradi, UI chizmaydi.
// =========================================================
const zaxiraJadvallar = new Set();
let zaxiraHolat = { zaxira: false, sabab: null };
const zaxiraKuzatuvchilar = new Set();

// Ichki: getter zaxiraga tushganda jadval nomini belgilaydi va kuzatuvchilarni xabardor qiladi.
// Bir jadval bir marta belgilanadi — holat obyekti faqat yangi jadvalda almashadi (stabil havola).
function belgila(sabab) {
  if (zaxiraJadvallar.has(sabab)) return;
  zaxiraJadvallar.add(sabab);
  zaxiraHolat = { zaxira: true, sabab: [...zaxiraJadvallar].join(', ') };
  zaxiraKuzatuvchilar.forEach((cb) => {
    try {
      cb(zaxiraHolat);
    } catch {
      // kuzatuvchi xatosi getter'ni to'xtatmasin
    }
  });
}

// { zaxira: boolean, sabab: string|null } — sabab: zaxiraga tushgan jadval(lar) nomi, vergul bilan
export function zaxiraHolati() {
  return zaxiraHolat;
}

// Obuna: cb(holat) har yangi zaxira belgisida chaqiriladi; qaytgan funksiya obunani bekor qiladi
export function zaxiraKuzat(cb) {
  zaxiraKuzatuvchilar.add(cb);
  return () => zaxiraKuzatuvchilar.delete(cb);
}

// Katta generatsiya qilingan zaxira modullari (talaba ~72 KB, doktorant ~98 KB) faqat kerak
// bo'lganda yuklanadi — /login va birinchi ochilishlar ularni bundle'ga olmaydi.
async function talabaZaxira(nomi, jadval) {
  belgila(jadval);
  const m = await import('./talaba-fallback');
  return m[nomi];
}
async function doktorantZaxira(nomi, jadval) {
  belgila(jadval);
  const m = await import('./doktorant-fallback');
  return m[nomi];
}

// Initial fallback mock data matching Supabase schema
export const INITIAL_PROFILES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    fish: 'Rahimov Jamshid Anvarovich',
    jshshir: '32405921820014',
    tug_ilgan_sana: '1988-04-12',
    jinsi: 'erkak',
    telefon: '+998 90 123 45 67',
    email: 'jamshid.r@ssv.uz',
    manzil_viloyat_id: 'toshkent-shahar',
    manzil_tuman: 'Chilonzor',
    hozirgi_bosqich: 'doktor',
    hozirgi_muassasa: 'Respublika ixtisoslashtirilgan Kardiologiya markazi',
    hozirgi_kurs: 5,
    yonalish_kodi: '70910205',
    ish_joyi: 'Respublika ixtisoslashtirilgan Kardiologiya markazi',
    lavozimi: 'Kardiolog-shifokor',
    rol: 'xodim',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fish: 'Karimova Shahlo Botirovna',
    jshshir: '41208942910023',
    tug_ilgan_sana: '1994-09-20',
    jinsi: 'ayol',
    telefon: '+998 93 456 78 90',
    email: 'shahlo.k@ssv.uz',
    manzil_viloyat_id: 'samarqand',
    manzil_tuman: 'Samarqand shahri',
    hozirgi_bosqich: 'magistr',
    hozirgi_muassasa: 'Samarqand davlat tibbiyot universiteti',
    hozirgi_kurs: 2,
    yonalish_kodi: '70910301',
    ish_joyi: 'Samarqand shahar 1-son bolalar shifoxonasi',
    lavozimi: 'Pediatr vrach-ordinator',
    rol: 'xodim',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    fish: 'SSV', // vazirlik hisobi — shaxs nomi emas (foydalanuvchi so'rovi),
    jshshir: '31502863920045',
    tug_ilgan_sana: '1982-11-05',
    jinsi: 'erkak',
    telefon: '+998 97 789 01 23',
    email: 'vazirlik@ssv.uz',
    manzil_viloyat_id: 'toshkent-shahar',
    manzil_tuman: 'Yunusobod',
    hozirgi_bosqich: 'doktorantura',
    hozirgi_muassasa: 'Toshkent tibbiyot akademiyasi',
    hozirgi_kurs: 3,
    yonalish_kodi: '14.00.33',
    ish_joyi: 'Sog‘liqni saqlash vazirligi',
    lavozimi: 'Bosh mutaxassis / Inspektor',
    rol: 'vazirlik',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    fish: 'Azizov Bekzod Rustamovich',
    jshshir: '30204912830056',
    tug_ilgan_sana: '1991-03-15',
    jinsi: 'erkak',
    telefon: '+998 99 333 44 55',
    email: 'admin@ssv.uz',
    manzil_viloyat_id: 'andijon',
    manzil_tuman: 'Asaka',
    hozirgi_bosqich: 'doktor',
    hozirgi_muassasa: 'Andijon davlat tibbiyot instituti',
    hozirgi_kurs: 4,
    yonalish_kodi: '70910212',
    ish_joyi: 'Asaka tumani markaziy shifoxonasi',
    lavozimi: 'Tizim administratori',
    rol: 'admin',
  },
];

export const INITIAL_LICENSES = [
  {
    id: 'l1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    tfx_raqami: 'TFX-2024-88912',
    mutaxassislik: 'Kardiologiya',
    berilgan_sana: '2024-02-10',
    amal_qilish_muddati: '2029-02-10',
    toifa: 'oliy',
    holati: 'amal_qilmoqda',
  },
  {
    id: 'l2',
    profile_id: '22222222-2222-2222-2222-222222222222',
    tfx_raqami: 'TFX-2021-44510',
    mutaxassislik: 'Pediatriya',
    berilgan_sana: '2021-08-15',
    amal_qilish_muddati: '2026-08-15',
    toifa: 'birinchi',
    holati: 'muddati_tugayapti',
  },
];

export const INITIAL_CREDITS = [
  {
    id: 'c1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    kurs_nomi: 'Zamonaviy kardiologik reanimatsiya va EKG tahlili',
    tashkilot_nomi: 'TIPME',
    kredit_ball: 36,
    sertifikat_raqami: 'TIPME-CR-2025-01',
    topshirilgan_sana: '2025-11-20',
  },
  {
    id: 'c2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    kurs_nomi: 'Yurak yetishmovchiligida farmakoterapiya',
    tashkilot_nomi: 'TIPME',
    kredit_ball: 24,
    sertifikat_raqami: 'TIPME-CR-2026-14',
    topshirilgan_sana: '2026-04-10',
  },
];

// Demo ta'lim tarixi (Supabase ulanmagan holat uchun)
export const INITIAL_EDUCATION = [
  {
    id: 'e1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    bosqich: 'bakalavr',
    muassasa_nomi: 'Toshkent tibbiyot akademiyasi',
    yonalish_nomi: 'Davolash ishi (Umumiy tibbiyot)',
    boshlangan_yil: 2006,
    tugatilgan_yil: 2012,
    diplom_raqami: 'B 1284561',
    diplom_sanasi: '2012-06-25',
    holati: 'tamomlagan',
  },
  {
    id: 'e2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    bosqich: 'magistr',
    muassasa_nomi: 'Toshkent tibbiyot akademiyasi',
    yonalish_nomi: 'Kardiologiya',
    boshlangan_yil: 2012,
    tugatilgan_yil: 2015,
    diplom_raqami: 'M 0447812',
    diplom_sanasi: '2015-06-30',
    holati: 'tamomlagan',
  },
];

// Litsenziya holatini mijoz tomonda hisoblash (DB computed field fallback'i)
export function litsenziyaHolati(amalQilishMuddati) {
  if (!amalQilishMuddati) return 'amal_qilmoqda';
  const muddat = new Date(amalQilishMuddati);
  const bugun = new Date();
  const oltiOyKeyin = new Date();
  oltiOyKeyin.setMonth(oltiOyKeyin.getMonth() + 6);
  if (muddat < bugun) return 'muddati_otgan';
  if (muddat <= oltiOyKeyin) return 'muddati_tugayapti';
  return 'amal_qilmoqda';
}

// ---- Xodim kabineti: ta'lim tarixi ----
export async function getTalimTarixi(profileId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('education_history')
      .select('*')
      .eq('profile_id', profileId)
      .order('boshlangan_yil', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch {
    belgila('education_history');
    return INITIAL_EDUCATION.filter((e) => e.profile_id === profileId);
  }
}

// Yozuvchi funksiyalar (add/delete) xatoda throw qiladi — chaqiruvchi try/catch bilan ushlaydi
// (app/profile/talim). Profil mutatorlari esa { ok, error } qaytaradi (pastda).
export async function addTalimYozuv(yozuv) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('education_history')
    .insert(yozuv)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTalimYozuv(id) {
  const supabase = createClient();
  const { error } = await supabase.from('education_history').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Xodim kabineti: litsenziyalar (holati — DB computed field) ----
export async function getLitsenziyalar(profileId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('licenses')
      .select('*,holati')
      .eq('profile_id', profileId)
      .order('berilgan_sana', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    belgila('licenses');
    return INITIAL_LICENSES.filter((l) => l.profile_id === profileId).map((l) => ({
      ...l,
      holati: litsenziyaHolati(l.amal_qilish_muddati),
    }));
  }
}

// ---- Xodim kabineti: UKTT kreditlari ----
export async function getKreditlar(profileId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('uktt_credits')
      .select('*')
      .eq('profile_id', profileId)
      .order('topshirilgan_sana', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    belgila('uktt_credits');
    return INITIAL_CREDITS.filter((c) => c.profile_id === profileId);
  }
}

// ---- Vazirlik/admin: barcha litsenziyalar (RLS ruxsat beradi) ----
export async function getBarchaLitsenziyalar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('licenses').select('*,holati');
    if (error) throw error;
    return data ?? [];
  } catch {
    belgila('licenses');
    return INITIAL_LICENSES.map((l) => ({ ...l, holati: litsenziyaHolati(l.amal_qilish_muddati) }));
  }
}

// ---- Klassifikator: yo'nalishlar ro'yxati ----
export async function getYonalishlar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('specializations')
      .select('kodi,nomi,bosqich,turi')
      .order('kodi');
    if (error) throw error;
    return data ?? [];
  } catch {
    // Klassifikator uchun INITIAL_* yo'q — bo'sh ro'yxat ham zaxira holati
    belgila('specializations');
    return [];
  }
}

// Helper: fetch all profiles (from Supabase or fallback).
// Talabalar (rol='talaba', 27 ming+) xodimlar reyestriga kirmaydi — ular public.talaba orqali ko'riladi.
export async function getProfiles() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('rol', 'talaba')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  belgila('profiles');
  return INITIAL_PROFILES;
}

// Helper: get profile by ID
export async function getProfileById(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (!error && data) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  belgila('profiles');
  return INITIAL_PROFILES.find((p) => p.id === id) || INITIAL_PROFILES[0];
}

// ---- Profil mutatorlari: { ok, error } qaytaradi, hech qachon throw qilmaydi ----
// Supabase sozlanganini chaqiruvchi tekshiradi (lib/auth.js supabaseSozlanganmi) — bu modul
// auth.js'ni import qilmaydi (aylanma import). RLS ruxsat bermasa Supabase xato bermay
// 0 qator qaytaradi — shuning uchun .select('id') bilan haqiqatan yozilganini tekshiramiz.
export async function yangilaProfil(id, maydonlar) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').update(maydonlar).eq('id', id).select('id');
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: 'Yozuv topilmadi yoki o‘zgartirishga ruxsat yo‘q' };
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e?.message || 'Tarmoq xatosi' };
  }
}

// Faqat profiles qatori o'chadi; auth.users hisobi anon kalit bilan o'chmaydi (service role kerak) —
// proxy.js profilsiz sessiyani chiqarib yuboradi.
export async function ochirProfil(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').delete().eq('id', id).select('id');
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: 'Yozuv topilmadi yoki o‘chirishga ruxsat yo‘q' };
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e?.message || 'Tarmoq xatosi' };
  }
}

// =========================================================
// Jamoat salomatligi texnikumlari — 2026 monitoring
// Manba: docs/Texnikumlar_viloyatlar_kesimida_2026 (1).xlsx
// Ustunlar supabase/migrations/004_texnikum_stat.sql sxemasiga mos.
// =========================================================

export const INITIAL_TEXNIKUM_STAT = [
  { hudud: 'Namangan', davlat: 7, nodavlat: 3, oquvchilar: 8076, ayollar: 7543, davlat_granti: 1792, kontrakt: 6001, bitiruvchi: 1032, qabul_kvota: 6279, pedagoglar: 513, vakant: 4, kompyuterlar: 435, laboratoriyalar: 16, simulyatsion: 41, amaliy_baza: 123, anketa_tuliq: 9 },
  { hudud: 'Farg‘ona', davlat: 9, nodavlat: 4, oquvchilar: 6445, ayollar: 5884, davlat_granti: 1283, kontrakt: 5172, bitiruvchi: 985, qabul_kvota: 4740, pedagoglar: 372, vakant: 5, kompyuterlar: 375, laboratoriyalar: 17, simulyatsion: 23, amaliy_baza: 244, anketa_tuliq: 6 },
  { hudud: 'Qashqadaryo', davlat: 4, nodavlat: 8, oquvchilar: 4063, ayollar: 3755, davlat_granti: 652, kontrakt: 3401, bitiruvchi: 693, qabul_kvota: 2299, pedagoglar: 202, vakant: 4, kompyuterlar: 381, laboratoriyalar: 12, simulyatsion: 36, amaliy_baza: 21, anketa_tuliq: 4 },
  { hudud: 'Jizzax', davlat: 4, nodavlat: 1, oquvchilar: 3628, ayollar: 3502, davlat_granti: 387, kontrakt: 3241, bitiruvchi: 981, qabul_kvota: 1882, pedagoglar: 299, vakant: 0, kompyuterlar: 196, laboratoriyalar: 16, simulyatsion: 15, amaliy_baza: 51, anketa_tuliq: 3 },
  { hudud: 'Andijon', davlat: 7, nodavlat: 2, oquvchilar: 2997, ayollar: 2761, davlat_granti: 311, kontrakt: 2686, bitiruvchi: 1489, qabul_kvota: 2430, pedagoglar: 231, vakant: 12, kompyuterlar: 240, laboratoriyalar: 5, simulyatsion: 15, amaliy_baza: 16, anketa_tuliq: 2 },
  { hudud: 'Navoiy', davlat: 3, nodavlat: 1, oquvchilar: 2365, ayollar: 2304, davlat_granti: 435, kontrakt: 1930, bitiruvchi: 546, qabul_kvota: 1709, pedagoglar: 181, vakant: 1, kompyuterlar: 144, laboratoriyalar: 8, simulyatsion: 27, amaliy_baza: 38, anketa_tuliq: 3 },
  { hudud: 'Sirdaryo', davlat: 3, nodavlat: 2, oquvchilar: 1949, ayollar: 1865, davlat_granti: 501, kontrakt: 1448, bitiruvchi: 378, qabul_kvota: 1260, pedagoglar: 140, vakant: 7, kompyuterlar: 214, laboratoriyalar: 41, simulyatsion: 16, amaliy_baza: 42, anketa_tuliq: 3 },
  { hudud: 'Surxondaryo', davlat: 5, nodavlat: 4, oquvchilar: 1862, ayollar: 1762, davlat_granti: 383, kontrakt: 1479, bitiruvchi: 206, qabul_kvota: 1626, pedagoglar: 69, vakant: 5, kompyuterlar: 165, laboratoriyalar: 50, simulyatsion: 6, amaliy_baza: 28, anketa_tuliq: 2 },
  { hudud: 'Toshkent sh.', davlat: 5, nodavlat: 10, oquvchilar: 1446, ayollar: 1349, davlat_granti: 248, kontrakt: 1198, bitiruvchi: 38, qabul_kvota: 1050, pedagoglar: 79, vakant: 8, kompyuterlar: 80, laboratoriyalar: 20, simulyatsion: 0, amaliy_baza: 15, anketa_tuliq: 1 },
  { hudud: 'Toshkent vil.', davlat: 6, nodavlat: 3, oquvchilar: 1282, ayollar: 1226, davlat_granti: 272, kontrakt: 1010, bitiruvchi: 488, qabul_kvota: 420, pedagoglar: 62, vakant: 12, kompyuterlar: 131, laboratoriyalar: 54, simulyatsion: 8, amaliy_baza: 6, anketa_tuliq: 2 },
  { hudud: 'Samarqand', davlat: 9, nodavlat: 3, oquvchilar: 1139, ayollar: 1000, davlat_granti: 214, kontrakt: 925, bitiruvchi: 400, qabul_kvota: 570, pedagoglar: 67, vakant: 1, kompyuterlar: 104, laboratoriyalar: 8, simulyatsion: 17, amaliy_baza: 0, anketa_tuliq: 1 },
  { hudud: 'Qoraqalpog‘iston', davlat: 6, nodavlat: 2, oquvchilar: 984, ayollar: 952, davlat_granti: 256, kontrakt: 682, bitiruvchi: 145, qabul_kvota: 983, pedagoglar: 88, vakant: 13, kompyuterlar: 156, laboratoriyalar: 4, simulyatsion: 11, amaliy_baza: 10, anketa_tuliq: 2 },
  { hudud: 'Buxoro', davlat: 4, nodavlat: 6, oquvchilar: 700, ayollar: 658, davlat_granti: 132, kontrakt: 568, bitiruvchi: 232, qabul_kvota: 510, pedagoglar: 37, vakant: 0, kompyuterlar: 68, laboratoriyalar: 0, simulyatsion: 1, amaliy_baza: 1, anketa_tuliq: 1 },
  { hudud: 'Xorazm', davlat: 2, nodavlat: 2, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa_tuliq: 0 },
];

export const INITIAL_TEXNIKUM_ANKETA = [
  { id: 1, muassasa: 'Olmaliq Abu Ali ibn Sino nomidagi JST', hudud: 'Toshkent viloyati', topshirilgan_sana: '2026-07-10', bolimlar: 10 },
  { id: 2, muassasa: 'Farg‘ona tumani Abu Ali ibn Sino nomidagi JST', hudud: 'Farg‘ona viloyati', topshirilgan_sana: '2026-06-19', bolimlar: 10 },
  { id: 3, muassasa: 'Ellikqal‘a Abu Ali ibn Sino nomidagi JST', hudud: 'Qoraqalpog‘iston Respublikasi', topshirilgan_sana: '2026-06-18', bolimlar: 10 },
];

// Hudud kesimida texnikum statistikasi (Supabase yoki fallback)
export async function getTexnikumStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('texnikum_hudud_stat')
      .select('*')
      .order('oquvchilar', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  belgila('texnikum_hudud_stat');
  return INITIAL_TEXNIKUM_STAT;
}

// So'nggi kelib tushgan muassasa anketalari (Supabase yoki fallback)
export async function getTexnikumAnketalar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('texnikum_anketa')
      .select('*')
      .order('topshirilgan_sana', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  belgila('texnikum_anketa');
  return INITIAL_TEXNIKUM_ANKETA;
}

// ---------------------------------------------------------
// Texnikumlar — muassasa kesimida (125 ta: 74 davlat + 51 xususiy)
// Manba: docs/Texnikumlar_viloyatlar_kesimida_2026 (1).xlsx
// Ustunlar supabase/migrations/005_texnikum_muassasa.sql sxemasiga mos.
// ---------------------------------------------------------

export const INITIAL_TEXNIKUM_MUASSASA = [
  { hudud: "Andijon", nomi: "Andijon Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Andijon JST", turi: "Davlat", tuman: "Andijon shahar", tashkil_yili: 2020, oquvchilar: 1971, ayollar: 1768, davlat_granti: 154, kontrakt: 1817, bitiruvchi: 1297, qabul_kvota: 2010, pedagoglar: 178, vakant: 3.5, kompyuterlar: 170, laboratoriyalar: 3, simulyatsion: 1, amaliy_baza: 1, anketa: true },
  { hudud: "Andijon", nomi: "Qo'rg'ontepa Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Paxtaobod Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Bo'ston Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Asaka Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi (Asaka tibbiyot kolleji)", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Xo'jaobod Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Xo'jaobod JST", turi: "Davlat", tuman: "Xo'jaobod tumani", tashkil_yili: 1987, oquvchilar: 1026, ayollar: 993, davlat_granti: 157, kontrakt: 869, bitiruvchi: 192, qabul_kvota: 420, pedagoglar: 53, vakant: 8, kompyuterlar: 70, laboratoriyalar: 2, simulyatsion: 14, amaliy_baza: 15, anketa: true },
  { hudud: "Andijon", nomi: "Baliqchi Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Andijan It-Med Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Andijon sh", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Andijon", nomi: "Aylim", qisqa_nomi: null, turi: "Xususiy", tuman: "Andijon sh", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Buxoro Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Afshona Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Qorako'l Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Qorako'l JST", turi: "Davlat", tuman: "Qorako'l tumani", tashkil_yili: 2004, oquvchilar: 700, ayollar: 658, davlat_granti: 132, kontrakt: 568, bitiruvchi: 232, qabul_kvota: 510, pedagoglar: 37, vakant: 0, kompyuterlar: 68, laboratoriyalar: 0, simulyatsion: 1, amaliy_baza: 1, anketa: true },
  { hudud: "Buxoro", nomi: "G'ijduvon Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Bukhara Avicenna Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxro shahri, Kogon t.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Buxoro Innovatsion Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxoro shahri, G'ijduvon", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Buxoro Xalqaro Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxoro sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Med Invest Innovatsion Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxoro sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Sharq Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxoro t", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Buxoro", nomi: "Turkiston Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Buxoro sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Jizzax", nomi: "Jizzax Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Jizzax JST", turi: "Davlat", tuman: "Jizzax shahar", tashkil_yili: 1966, oquvchilar: 1557, ayollar: 1488, davlat_granti: 220, kontrakt: 1337, bitiruvchi: 445, qabul_kvota: 840, pedagoglar: 154, vakant: 0, kompyuterlar: 80, laboratoriyalar: 2, simulyatsion: 12, amaliy_baza: 24, anketa: true },
  { hudud: "Jizzax", nomi: "Do'stlik Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Jizzax", nomi: "Zomin Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Jizzax", nomi: "G'allaorol Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "G'allaorol JST", turi: "Davlat", tuman: "G'allaorol tumani", tashkil_yili: 1988, oquvchilar: 764, ayollar: 731, davlat_granti: 167, kontrakt: 597, bitiruvchi: 27, qabul_kvota: 360, pedagoglar: 45, vakant: 0, kompyuterlar: 36, laboratoriyalar: 14, simulyatsion: 1, amaliy_baza: 12, anketa: true },
  { hudud: "Jizzax", nomi: "KO'P TARMOQLI TIBBIYOT TEXNIKUMI MAS'ULIYATI CHEKLANGAN JAMIYAT", qisqa_nomi: "KTT MChJ", turi: "Xususiy", tuman: "Sharof Rashidov tumani", tashkil_yili: 2023, oquvchilar: 1307, ayollar: 1283, davlat_granti: 0, kontrakt: 1307, bitiruvchi: 509, qabul_kvota: 682, pedagoglar: 100, vakant: 0, kompyuterlar: 80, laboratoriyalar: 0, simulyatsion: 2, amaliy_baza: 15, anketa: true },
  { hudud: "Qashqadaryo", nomi: "Qarshi Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Qarshi JST", turi: "Davlat", tuman: "Qarshi shahri", tashkil_yili: 1982, oquvchilar: 1424, ayollar: 1320, davlat_granti: 200, kontrakt: 1224, bitiruvchi: 305, qabul_kvota: 555, pedagoglar: 69, vakant: 1, kompyuterlar: 98, laboratoriyalar: 2, simulyatsion: 7, amaliy_baza: 0, anketa: true },
  { hudud: "Qashqadaryo", nomi: "Muborak Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Muborak JST", turi: "Davlat", tuman: "Muborak tumani", tashkil_yili: 1991, oquvchilar: 835, ayollar: 765, davlat_granti: 189, kontrakt: 646, bitiruvchi: 145, qabul_kvota: 360, pedagoglar: 32, vakant: 0, kompyuterlar: 75, laboratoriyalar: 0, simulyatsion: 8, amaliy_baza: 14, anketa: true },
  { hudud: "Qashqadaryo", nomi: "Shahrisabz Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Shahrisabz JST", turi: "Davlat", tuman: "Shahrisabz shahar", tashkil_yili: 1966, oquvchilar: 1158, ayollar: 1119, davlat_granti: 120, kontrakt: 1028, bitiruvchi: 243, qabul_kvota: 1024, pedagoglar: 46, vakant: 3, kompyuterlar: 119, laboratoriyalar: 10, simulyatsion: 5, amaliy_baza: 3, anketa: true },
  { hudud: "Qashqadaryo", nomi: "Dehqonobod Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Dehqonobod JST", turi: "Davlat", tuman: "Dehqonobod tumani", tashkil_yili: 2009, oquvchilar: 646, ayollar: 551, davlat_granti: 143, kontrakt: 503, bitiruvchi: 0, qabul_kvota: 360, pedagoglar: 55, vakant: 0, kompyuterlar: 89, laboratoriyalar: 0, simulyatsion: 16, amaliy_baza: 4, anketa: true },
  { hudud: "Qashqadaryo", nomi: "Beruniy Nomidagi Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi sh", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Ilm-U Ziyo Biznes--Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Koson Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Koson", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Qarshi Salomatlik Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Qarshi Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi shahri, Koson t,", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Shaxrisabz Xalqaro Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Shahrisabz", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Tabobat Ilmi Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qashqadaryo", nomi: "Xalqaro Innovatsion Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Qarshi sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Navoiy", nomi: "Navoiy Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Navoiy JST", turi: "Davlat", tuman: "Navoiy shahar", tashkil_yili: 1982, oquvchilar: 1248, ayollar: 1210, davlat_granti: 169, kontrakt: 1079, bitiruvchi: 317, qabul_kvota: 659, pedagoglar: 98, vakant: 0, kompyuterlar: 64, laboratoriyalar: 6, simulyatsion: 10, amaliy_baza: 32, anketa: true },
  { hudud: "Navoiy", nomi: "Xatirchi Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Xatirchi JST", turi: "Davlat", tuman: "Xatirchi tumani", tashkil_yili: 2020, oquvchilar: 607, ayollar: 596, davlat_granti: 125, kontrakt: 482, bitiruvchi: 229, qabul_kvota: 690, pedagoglar: 44, vakant: 0, kompyuterlar: 36, laboratoriyalar: 1, simulyatsion: 13, amaliy_baza: 5, anketa: true },
  { hudud: "Navoiy", nomi: "Zarafshon Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Zarafshon tibbiyot texnikumi", turi: "Davlat", tuman: "Zarafshon shahar", tashkil_yili: 1993, oquvchilar: 510, ayollar: 498, davlat_granti: 141, kontrakt: 369, bitiruvchi: 0, qabul_kvota: 360, pedagoglar: 39, vakant: 1, kompyuterlar: 44, laboratoriyalar: 1, simulyatsion: 4, amaliy_baza: 1, anketa: true },
  { hudud: "Navoiy", nomi: "Navoiy Med Invest Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Navoiy sh", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Namangan", nomi: "Kasbiy ta`lim agentligi huzuridagi 1-son Namangan Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "1-son Namangan JST", turi: "Davlat", tuman: "Namangan shahar", tashkil_yili: 1938, oquvchilar: 1203, ayollar: 1102, davlat_granti: 255, kontrakt: 948, bitiruvchi: 261, qabul_kvota: 660, pedagoglar: 96, vakant: 0, kompyuterlar: 73, laboratoriyalar: 3, simulyatsion: 6, amaliy_baza: 21, anketa: true },
  { hudud: "Namangan", nomi: "Kosonsoy Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Kosonsoy JST", turi: "Davlat", tuman: "Kosonsoy tumani", tashkil_yili: 1986, oquvchilar: 817, ayollar: 730, davlat_granti: 256, kontrakt: 561, bitiruvchi: 179, qabul_kvota: 660, pedagoglar: 37, vakant: 0, kompyuterlar: 50, laboratoriyalar: 2, simulyatsion: 6, amaliy_baza: 30, anketa: true },
  { hudud: "Namangan", nomi: "Chortoq Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Chortoq JST", turi: "Davlat", tuman: "Chortoq tumani", tashkil_yili: 1984, oquvchilar: 910, ayollar: 838, davlat_granti: 309, kontrakt: 601, bitiruvchi: 167, qabul_kvota: 540, pedagoglar: 62, vakant: 0, kompyuterlar: 35, laboratoriyalar: 3, simulyatsion: 6, amaliy_baza: 0, anketa: true },
  { hudud: "Namangan", nomi: "Norin Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Norin JST", turi: "Davlat", tuman: "Norin tumani", tashkil_yili: 2006, oquvchilar: 732, ayollar: 707, davlat_granti: 148, kontrakt: 403, bitiruvchi: 199, qabul_kvota: 405, pedagoglar: 48, vakant: 1.5, kompyuterlar: 30, laboratoriyalar: 4, simulyatsion: 5, amaliy_baza: 4, anketa: true },
  { hudud: "Namangan", nomi: "2-son Namangan Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "2-son Namangan JST", turi: "Davlat", tuman: "Yangi Namangan tumani", tashkil_yili: null, oquvchilar: 1001, ayollar: 930, davlat_granti: 297, kontrakt: 704, bitiruvchi: 226, qabul_kvota: 690, pedagoglar: 108, vakant: 0, kompyuterlar: 68, laboratoriyalar: 0, simulyatsion: 2, amaliy_baza: 42, anketa: true },
  { hudud: "Namangan", nomi: "Pop Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Pop JST", turi: "Davlat", tuman: "Pop tumani", tashkil_yili: 2007, oquvchilar: 806, ayollar: 767, davlat_granti: 166, kontrakt: 538, bitiruvchi: 0, qabul_kvota: 450, pedagoglar: 48, vakant: 0, kompyuterlar: 42, laboratoriyalar: 0, simulyatsion: 11, amaliy_baza: 4, anketa: true },
  { hudud: "Namangan", nomi: "Chust Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Chust JST", turi: "Davlat", tuman: "Chust tumani", tashkil_yili: 1984, oquvchilar: 901, ayollar: 872, davlat_granti: 361, kontrakt: 540, bitiruvchi: 0, qabul_kvota: 660, pedagoglar: 60, vakant: 2, kompyuterlar: 61, laboratoriyalar: 0, simulyatsion: 1, amaliy_baza: 12, anketa: true },
  { hudud: "Namangan", nomi: "Namangan innovatsion tibbiyot texnikumi", qisqa_nomi: "NITT", turi: "Xususiy", tuman: "Namangan shahar", tashkil_yili: 2024, oquvchilar: 1120, ayollar: 1061, davlat_granti: 0, kontrakt: 1120, bitiruvchi: 0, qabul_kvota: 1344, pedagoglar: 0, vakant: 0, kompyuterlar: 30, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: true },
  { hudud: "Namangan", nomi: "Turan MED xalqaro tibbiyot texnikumi", qisqa_nomi: "Turan MED", turi: "Xususiy", tuman: "Namangan shahar", tashkil_yili: 2024, oquvchilar: 586, ayollar: 536, davlat_granti: 0, kontrakt: 586, bitiruvchi: 0, qabul_kvota: 870, pedagoglar: 54, vakant: 0, kompyuterlar: 46, laboratoriyalar: 4, simulyatsion: 4, amaliy_baza: 10, anketa: true },
  { hudud: "Namangan", nomi: "Namangan Xalqaro Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Namangan", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Samarqand Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Siyob Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Kattaqo'rg'on Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Kattaqo'rg'on JST", turi: "Davlat", tuman: "Kattaqo'rg'on tumani", tashkil_yili: 1966, oquvchilar: 1139, ayollar: 1000, davlat_granti: 214, kontrakt: 925, bitiruvchi: 400, qabul_kvota: 570, pedagoglar: 67, vakant: 1, kompyuterlar: 104, laboratoriyalar: 8, simulyatsion: 17, amaliy_baza: 0, anketa: true },
  { hudud: "Samarqand", nomi: "Ishtixon Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Pastdarg'om Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Paxtachi Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Urgut Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Payariq Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "So'zangaron Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Samarqand Viloyati Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Samarqand sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Tibbiyot Texnikumi Ochiloff", qisqa_nomi: null, turi: "Xususiy", tuman: "Samarqand sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Samarqand", nomi: "Turon Med-Class", qisqa_nomi: null, turi: "Xususiy", tuman: "Samarqand sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Termiz Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Denov Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Denov JST", turi: "Davlat", tuman: "Denov tumani", tashkil_yili: 2020, oquvchilar: 1064, ayollar: 1014, davlat_granti: 181, kontrakt: 883, bitiruvchi: 206, qabul_kvota: 1086, pedagoglar: 44, vakant: 2, kompyuterlar: 114, laboratoriyalar: 8, simulyatsion: 3, amaliy_baza: 15, anketa: true },
  { hudud: "Surxondaryo", nomi: "Sariosiyo Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Sherobod Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Kasbiy ta'lim agentligi huzuridagi Sho'rchi Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Sho'rchi JST", turi: "Davlat", tuman: "Sho'rchi tumani", tashkil_yili: 2023, oquvchilar: 798, ayollar: 748, davlat_granti: 202, kontrakt: 596, bitiruvchi: 0, qabul_kvota: 540, pedagoglar: 25, vakant: 3, kompyuterlar: 51, laboratoriyalar: 42, simulyatsion: 3, amaliy_baza: 13, anketa: true },
  { hudud: "Surxondaryo", nomi: "Denov Ziyo Medical Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Denov", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Med Innovatsion It Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Termiz sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Medstart Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Sho'rchi t", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Surxondaryo", nomi: "Surxandaryo Viloyati Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Termiz sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Sirdaryo", nomi: "Sirdaryo Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Sirdaryo JST", turi: "Davlat", tuman: "Sirdaryo tumani", tashkil_yili: 2008, oquvchilar: 451, ayollar: 437, davlat_granti: 141, kontrakt: 310, bitiruvchi: 180, qabul_kvota: 450, pedagoglar: 46, vakant: 4, kompyuterlar: 78, laboratoriyalar: 2, simulyatsion: 2, amaliy_baza: 4, anketa: true },
  { hudud: "Sirdaryo", nomi: "Guliston Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Guliston JST", turi: "Davlat", tuman: "Guliston shahar", tashkil_yili: 1964, oquvchilar: 812, ayollar: 774, davlat_granti: 187, kontrakt: 625, bitiruvchi: 31, qabul_kvota: 450, pedagoglar: 52, vakant: 2, kompyuterlar: 58, laboratoriyalar: 37, simulyatsion: 5, amaliy_baza: 26, anketa: true },
  { hudud: "Sirdaryo", nomi: "Yangiyer Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Yangiyer JST", turi: "Davlat", tuman: "Yangiyer shahar", tashkil_yili: 2004, oquvchilar: 686, ayollar: 654, davlat_granti: 173, kontrakt: 513, bitiruvchi: 167, qabul_kvota: 360, pedagoglar: 42, vakant: 1, kompyuterlar: 78, laboratoriyalar: 2, simulyatsion: 9, amaliy_baza: 12, anketa: true },
  { hudud: "Sirdaryo", nomi: "Guliston Tibbiyot Va It Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Guliston sh", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Sirdaryo", nomi: "It Med Xalqaro Talim Klasteri", qisqa_nomi: null, turi: "Xususiy", tuman: "Guliston shahri, Boyovut t.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "1- Respublika Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Chilonzor Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Yunusobod Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "2-son Respublika Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "2-son RJST", turi: "Davlat", tuman: "Toshkent shahar", tashkil_yili: 1918, oquvchilar: 1446, ayollar: 1349, davlat_granti: 248, kontrakt: 1198, bitiruvchi: 38, qabul_kvota: 1050, pedagoglar: 79, vakant: 8, kompyuterlar: 80, laboratoriyalar: 20, simulyatsion: 0, amaliy_baza: 15, anketa: true },
  { hudud: "Toshkent sh.", nomi: "Sergeli Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Toshkent Kasb-Hunar Va Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Chilonzor, Sergeli", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Alpha Professional Ta’Lim", qisqa_nomi: null, turi: "Xususiy", tuman: "Chilonzor", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Alpha Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Yunusobod", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Avitsenna Tibbiyot Texnikum", qisqa_nomi: null, turi: "Xususiy", tuman: "Chilonzor, Olmazor", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Collegeofemu", qisqa_nomi: null, turi: "Xususiy", tuman: "Yakkasaroy", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Muhandislik Va Texnologiyalar Oliy Maktabi", qisqa_nomi: null, turi: "Xususiy", tuman: "Yakkasaroy", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Registon Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Olmazor", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Topex Texnikum", qisqa_nomi: null, turi: "Xususiy", tuman: "Sergeli", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Toshkent Stomatologiya Va Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Yunusobod", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent sh.", nomi: "Wise Medical Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Sergeli", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Bekobod Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Zangiota Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Olmaliq Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Olmaliq JST", turi: "Davlat", tuman: "Olmaliq", tashkil_yili: 2020, oquvchilar: 480, ayollar: 458, davlat_granti: 96, kontrakt: 384, bitiruvchi: 269, qabul_kvota: 420, pedagoglar: 39, vakant: 9.5, kompyuterlar: 86, laboratoriyalar: 54, simulyatsion: 2, amaliy_baza: 4, anketa: true },
  { hudud: "Toshkent vil.", nomi: "Yangiyo'l Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Yangiyo'l JST", turi: "Davlat", tuman: "Yangiyo'l shahar", tashkil_yili: 2020, oquvchilar: 802, ayollar: 768, davlat_granti: 176, kontrakt: 626, bitiruvchi: 219, qabul_kvota: 0, pedagoglar: 23, vakant: 3, kompyuterlar: 45, laboratoriyalar: 0, simulyatsion: 6, amaliy_baza: 2, anketa: true },
  { hudud: "Toshkent vil.", nomi: "Chirchiq Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Angren Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Chirchiq-Innovatsion-Tibbiyot Va Salomatlik-Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Chirchiq sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Toshkent Viloyati Innovatsion-Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Bekobod sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Toshkent vil.", nomi: "Toshkent Xalqaro Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Chirchiq sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Marg'ilon Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "2-son Marg'ilon Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "2-son Marg'ilon JST", turi: "Davlat", tuman: "Marg'ilon shahar", tashkil_yili: 2006, oquvchilar: 855, ayollar: 817, davlat_granti: 158, kontrakt: 697, bitiruvchi: 425, qabul_kvota: 990, pedagoglar: 38, vakant: 2, kompyuterlar: 55, laboratoriyalar: 1, simulyatsion: 4, amaliy_baza: 3, anketa: true },
  { hudud: "Farg'ona", nomi: "Beshariq Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Quva Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Rishton Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Rishton JST", turi: "Davlat", tuman: "Rishton tumani", tashkil_yili: 2007, oquvchilar: 1085, ayollar: 1015, davlat_granti: 201, kontrakt: 884, bitiruvchi: 358, qabul_kvota: 1200, pedagoglar: 68, vakant: 1, kompyuterlar: 60, laboratoriyalar: 6, simulyatsion: 4, amaliy_baza: 12, anketa: true },
  { hudud: "Farg'ona", nomi: "Buvayda Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Buvayda JST", turi: "Davlat", tuman: "Buvayda tumani", tashkil_yili: 2008, oquvchilar: 604, ayollar: 577, davlat_granti: 133, kontrakt: 471, bitiruvchi: 145, qabul_kvota: 360, pedagoglar: 45, vakant: 0, kompyuterlar: 45, laboratoriyalar: 5, simulyatsion: 4, amaliy_baza: 8, anketa: true },
  { hudud: "Farg'ona", nomi: "2-Farg'on Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "FJST", turi: "Davlat", tuman: "Farg'ona shahar", tashkil_yili: 1983, oquvchilar: 1451, ayollar: 1279, davlat_granti: 239, kontrakt: 1222, bitiruvchi: 30, qabul_kvota: 660, pedagoglar: 88, vakant: 2, kompyuterlar: 57, laboratoriyalar: 0, simulyatsion: 1, amaliy_baza: 0, anketa: true },
  { hudud: "Farg'ona", nomi: "Farg'ona tumani Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Farg'ona tumani tibbiyot texnikumi", turi: "Davlat", tuman: "Farg'ona tumani", tashkil_yili: 2009, oquvchilar: 545, ayollar: 528, davlat_granti: 149, kontrakt: 396, bitiruvchi: 0, qabul_kvota: 510, pedagoglar: 36, vakant: 0, kompyuterlar: 48, laboratoriyalar: 1, simulyatsion: 4, amaliy_baza: 5, anketa: true },
  { hudud: "Farg'ona", nomi: "Qo'qon Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi", qisqa_nomi: "Qo'qon JST", turi: "Davlat", tuman: "Qo'qon shahar", tashkil_yili: 1925, oquvchilar: 1905, ayollar: 1668, davlat_granti: 403, kontrakt: 1502, bitiruvchi: 27, qabul_kvota: 1020, pedagoglar: 97, vakant: 0, kompyuterlar: 110, laboratoriyalar: 4, simulyatsion: 6, amaliy_baza: 216, anketa: true },
  { hudud: "Farg'ona", nomi: "Alfa Medical College", qisqa_nomi: null, turi: "Xususiy", tuman: "Oltiariq t", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Avisena Medical Texnikum", qisqa_nomi: null, turi: "Xususiy", tuman: "Yozyovon", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Registan Medical Texnikum", qisqa_nomi: null, turi: "Xususiy", tuman: "Farg'ona sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Farg'ona", nomi: "Sino Tibbiyot Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Farg'ona sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Xorazm", nomi: "Urganch Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Xorazm", nomi: "Xiva Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Xorazm", nomi: "Khiva Medical Tekhnikum", qisqa_nomi: null, turi: "Xususiy", tuman: "Xiva", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Xorazm", nomi: "Xorazm Med Invest Tabobat Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Urganch", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "Nukus Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "Xo'jayli Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "2-son Nukus Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "Qo'ng'irot Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Qo'ng'irot JST", turi: "Davlat", tuman: "Qo'ng'irot tumani", tashkil_yili: 2007, oquvchilar: 364, ayollar: 345, davlat_granti: 110, kontrakt: 208, bitiruvchi: 90, qabul_kvota: 353, pedagoglar: 43, vakant: 1, kompyuterlar: 74, laboratoriyalar: 1, simulyatsion: 1, amaliy_baza: 7, anketa: true },
  { hudud: "Qoraqalpog'iston", nomi: "To'rtko'l Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: null, turi: "Davlat", tuman: null, tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "Ellikqal'a Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi", qisqa_nomi: "Ellikqal'a JST", turi: "Davlat", tuman: "Ellikqal'a tumani", tashkil_yili: 2003, oquvchilar: 620, ayollar: 607, davlat_granti: 146, kontrakt: 474, bitiruvchi: 55, qabul_kvota: 630, pedagoglar: 45, vakant: 12, kompyuterlar: 82, laboratoriyalar: 3, simulyatsion: 10, amaliy_baza: 3, anketa: true },
  { hudud: "Qoraqalpog'iston", nomi: "Aralboyi Medicina Ham Transport Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Nukus sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
  { hudud: "Qoraqalpog'iston", nomi: "Nukus Tibbiyot Va It Texnikumi", qisqa_nomi: null, turi: "Xususiy", tuman: "Nukus sh.", tashkil_yili: null, oquvchilar: 0, ayollar: 0, davlat_granti: 0, kontrakt: 0, bitiruvchi: 0, qabul_kvota: 0, pedagoglar: 0, vakant: 0, kompyuterlar: 0, laboratoriyalar: 0, simulyatsion: 0, amaliy_baza: 0, anketa: false },
];

// Muassasa kesimidagi ro'yxat — Supabase, aks holda INITIAL_* fallback
export async function getTexnikumMuassasalar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('texnikum_muassasa')
      .select('*')
      .order('oquvchilar', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  belgila('texnikum_muassasa');
  return INITIAL_TEXNIKUM_MUASSASA;
}

// =========================================================
// Oliy ta'lim talabalari — TDTU kontingenti (03.09.2026)
// Manba: docs/bakalavriat/TDTU_03_09_2026_..._Talabalar_ro'yxati.xlsx
// Jadval/view'lar: supabase/migrations/006_talaba.sql
// =========================================================

// talim_turi × fakultet × kurs × jinsi
export async function getTalabaFakultetStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba_fakultet_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return talabaZaxira('INITIAL_TALABA_FAKULTET_STAT', 'talaba_fakultet_stat');
}

// talim_turi × fakultet × mutaxassislik
export async function getTalabaMutaxassislikStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba_mutaxassislik_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return talabaZaxira('INITIAL_TALABA_MUTAXASSISLIK_STAT', 'talaba_mutaxassislik_stat');
}

// Magistr kesimi: kurs × jinsi × kampus × til × qabul yili (007_magistr.sql view)
export async function getTalabaMagistrStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba_magistr_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return talabaZaxira('INITIAL_TALABA_MAGISTR_STAT', 'talaba_magistr_stat');
}

// Magistr mutaxassisliklari: shifr × nom × kurs × jinsi (007_magistr.sql view)
export async function getTalabaMagistrMutStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba_magistr_mut_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return talabaZaxira('INITIAL_TALABA_MAGISTR_MUT_STAT', 'talaba_magistr_mut_stat');
}

// Yosh tarkibi: talim_turi × tug'ilgan yil × jinsi (007_magistr.sql view)
export async function getTalabaYoshStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba_yosh_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return talabaZaxira('INITIAL_TALABA_YOSH_STAT', 'talaba_yosh_stat');
}

// Kirgan talabaning o'z qatori (RLS: user_id = auth.uid())
export async function getTalabaByUser(userId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('talaba').select('*').eq('user_id', userId).maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

// =========================================================
// Boshqaruv paneli — jadvallar hajmi (jonli count, admin RLS)
// Har bir jadval uchun select('*', { count: 'exact', head: true });
// profiles rol bo'yicha 4 qatorga ajratiladi (.eq('rol', r)); rol='talaba'
// ichida doktorantura bosqichi alohida qator (.eq('hozirgi_bosqich', b)).
// Supabase sozlanmagan, xato yoki count null bo'lsa — 2026-09-07
// holatidagi ma'lum qiymat (fallback) ko'rsatiladi, hech qachon throw qilmaydi.
// profiles talaba 28 122 = talaba 27 739 + doktorant 383 (hisoblar 2026-09-06 ochilgan).
// =========================================================
const JADVAL_HAJMLARI = [
  { jadval: 'profiles', rol: 'talaba', nomi: 'Foydalanuvchilar — talaba', manba: 'Hisoblar ochilgan 2026-09-06', fallback: 28122 },
  { jadval: 'talaba', nomi: 'Talabalar (TDTU kontingenti)', manba: 'TDTU ro‘yxati 03.09.2026', fallback: 27739 },
  { jadval: 'doktorant', nomi: 'Doktorantlar (PhD / DSc, TDTU)', manba: 'TDTU doktorantlar ro‘yxati 04.09.2026', fallback: 383 },
  { jadval: 'profiles', rol: 'talaba', bosqich: 'doktorantura', nomi: 'Foydalanuvchilar — talaba (doktorantura)', manba: 'Hisoblar ochilgan 2026-09-06', fallback: 383 },
  { jadval: 'profiles', rol: 'xodim', nomi: 'Foydalanuvchilar — xodim', manba: 'Demo ma’lumot', fallback: 7 },
  { jadval: 'profiles', rol: 'vazirlik', nomi: 'Foydalanuvchilar — vazirlik', manba: 'Demo ma’lumot', fallback: 1 },
  { jadval: 'profiles', rol: 'admin', nomi: 'Foydalanuvchilar — admin', manba: 'Demo ma’lumot', fallback: 1 },
  { jadval: 'texnikum_muassasa', nomi: 'Texnikum muassasalari', manba: 'Anketa yig‘masi 2026', fallback: 125 },
  { jadval: 'specializations', nomi: 'Yo‘nalishlar klassifikatori', manba: 'Klassifikator (seed)', fallback: 98 },
  { jadval: 'education_history', nomi: 'Ta‘lim tarixi yozuvlari', manba: 'Demo ma’lumot', fallback: 15 },
  { jadval: 'texnikum_hudud_stat', nomi: 'Texnikum — hudud statistikasi', manba: 'Anketa yig‘masi 2026', fallback: 14 },
  { jadval: 'uktt_credits', nomi: 'UKTT kreditlari', manba: 'Demo ma’lumot', fallback: 4 },
  { jadval: 'texnikum_anketa', nomi: 'Texnikum anketalari', manba: 'Demo ma’lumot', fallback: 3 },
  { jadval: 'licenses', nomi: 'Litsenziyalar', manba: 'Demo ma’lumot', fallback: 2 },
];

// Qaytaradi: [{ jadval, nomi, qatorlar, manba, rol?, bosqich?, jonli }] — jonli=false bo'lsa qator fallback qiymat
export async function getJadvalHajmlari() {
  const qator = (j, count) => ({
    jadval: j.jadval,
    ...(j.rol ? { rol: j.rol } : {}),
    ...(j.bosqich ? { bosqich: j.bosqich } : {}),
    nomi: j.nomi,
    qatorlar: count ?? j.fallback,
    manba: j.manba,
    jonli: count != null,
  });
  try {
    const supabase = createClient();
    const sanoqlar = await Promise.all(
      JADVAL_HAJMLARI.map(async (j) => {
        try {
          let sorov = supabase.from(j.jadval).select('*', { count: 'exact', head: true });
          if (j.rol) sorov = sorov.eq('rol', j.rol);
          if (j.bosqich) sorov = sorov.eq('hozirgi_bosqich', j.bosqich);
          const { count, error } = await sorov;
          if (error || count == null) {
            belgila(j.jadval);
            return null;
          }
          return count;
        } catch {
          belgila(j.jadval);
          return null;
        }
      })
    );
    return JADVAL_HAJMLARI.map((j, i) => qator(j, sanoqlar[i]));
  } catch {
    JADVAL_HAJMLARI.forEach((j) => belgila(j.jadval));
    return JADVAL_HAJMLARI.map((j) => qator(j, null));
  }
}

// =========================================================
// Doktorantura (PhD / DSc / stajyor) — TDTU 2024–2026
// Manba: docs/doktarantlar_tayanch_doktarant.xlsx; jadval/view'lar: 008_doktorant.sql
// =========================================================

export async function getDoktorantStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('doktorant_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return doktorantZaxira('INITIAL_DOKTORANT_STAT', 'doktorant_stat');
}

export async function getDoktorantRahbarStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('doktorant_rahbar_stat').select('*');
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return doktorantZaxira('INITIAL_DOKTORANT_RAHBAR_STAT', 'doktorant_rahbar_stat');
}

// Kirgan doktorantning o'z qatori (RLS: user_id = auth.uid())
export async function getDoktorantByUser(userId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('doktorant').select('*').eq('user_id', userId).maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}


// =========================================================
// Ilm-fan va innovatsiyalar — story-e'lonlar (010_elonlar.sql)
// elonlar / elon_korishlar / sozlamalar; view'lar elon_stat, elon_korish_royxati
// =========================================================

export const SOZLAMA_STANDART = {
  storylar_yoqilgan: true,
  story_davomiyligi: 6,
  story_muddat_kun: 30,
  story_kim_qosha_oladi: ['admin', 'vazirlik'],
};
const KORILGAN_KALIT = 'uttp_korilgan_elonlar';

function localKorilgan() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KORILGAN_KALIT) || '[]'));
  } catch {
    return new Set();
  }
}

// Barcha e'lonlar (RLS: oddiy foydalanuvchi faqat faol, admin/vazirlik arxivni ham)
export async function getElonlar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('elonlar')
      .select('*')
      .order('tartib', { ascending: true })
      .order('boshlanish', { ascending: false });
    if (error || !data) return INITIAL_ELONLAR;
    return data;
  } catch {
    return INITIAL_ELONLAR;
  }
}

// Bitta e'lon (batafsil sahifa). Topilmasa null.
export async function getElon(id) {
  const fallback = INITIAL_ELONLAR.find((e) => String(e.id) === String(id)) || null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('elonlar').select('*').eq('id', id).maybeSingle();
    if (error) return fallback;
    return data || null;
  } catch {
    return fallback;
  }
}

// Ko'rishlar statistikasi: { [elon_id]: { korishlar, oxirgi } } (admin/vazirlik to'liq ko'radi)
export async function getElonStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('elon_stat').select('*');
    if (error || !data) return {};
    return Object.fromEntries(data.map((r) => [r.elon_id, r]));
  } catch {
    return {};
  }
}

// Kim ko'rgan — bitta e'lon bo'yicha ro'yxat (admin/vazirlik)
export async function getElonKorishlar(elonId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('elon_korish_royxati')
      .select('*')
      .eq('elon_id', elonId)
      .order('korilgan', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// Joriy foydalanuvchi ko'rgan e'lonlar (halqa rangi uchun) — Supabase + localStorage birlashmasi.
// userId shart: admin/vazirlik RLS orqali BARCHA ko'rishlarni o'qiy oladi, faqat o'zinikini olish uchun filtr.
export async function getMeningKorishlarim(userId) {
  const lokal = localKorilgan();
  if (!userId || String(userId).includes('@')) return lokal;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('elon_korishlar').select('elon_id').eq('user_id', userId);
    if (!error && data) data.forEach((r) => lokal.add(r.elon_id));
  } catch {
    // demo-rejim — faqat lokal
  }
  return lokal;
}

// Ko'rish belgisi (har foydalanuvchi — har e'lon uchun bir marta)
export async function korildiBelgila(elonId, userId) {
  try {
    const lokal = localKorilgan();
    lokal.add(elonId);
    localStorage.setItem(KORILGAN_KALIT, JSON.stringify([...lokal]));
  } catch {
    // localStorage yopiq bo'lsa — e'tiborsiz
  }
  if (!userId || String(userId).includes('@')) return; // demo profil (id = email) — serverga yozilmaydi
  try {
    const supabase = createClient();
    await supabase
      .from('elon_korishlar')
      .upsert({ elon_id: elonId, user_id: userId }, { onConflict: 'elon_id,user_id', ignoreDuplicates: true });
  } catch {
    // tarmoq xatosi — lokal belgi qoladi
  }
}

// E'lon yaratish/yangilash (admin, vazirlik — RLS tekshiradi). Natija: { ok, data, error }
export async function saqlaElon(elon) {
  const { id, ...maydonlar } = elon;
  try {
    const supabase = createClient();
    const sorov = id
      ? supabase.from('elonlar').update(maydonlar).eq('id', id).select('*').single()
      : supabase.from('elonlar').insert(maydonlar).select('*').single();
    const { data, error } = await sorov;
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e?.message || 'Tarmoq xatosi' };
  }
}

export async function ochirElon(id) {
  try {
    const supabase = createClient();
    const { error, data } = await supabase.from('elonlar').delete().eq('id', id).select('id');
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: 'Ruxsat yo‘q yoki e‘lon topilmadi' };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'Tarmoq xatosi' };
  }
}

// Sozlamalar: { kalit: qiymat } (jsonb qiymatlar), standart bilan birlashtirilgan
export async function getSozlamalar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('sozlamalar').select('kalit,qiymat,izoh,yangilangan');
    if (error || !data) return { ...SOZLAMA_STANDART };
    const natija = { ...SOZLAMA_STANDART };
    data.forEach((r) => {
      natija[r.kalit] = r.qiymat;
    });
    return natija;
  } catch {
    return { ...SOZLAMA_STANDART };
  }
}

export async function saqlaSozlama(kalit, qiymat, izoh) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('sozlamalar')
      .upsert({ kalit, qiymat, izoh: izoh ?? null, yangilangan: new Date().toISOString() }, { onConflict: 'kalit' });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'Tarmoq xatosi' };
  }
}

// =========================================================
// Tibbiy jihozlar — muassasa kesimida (docs/equipment_summary.xlsx, 3 875 muassasa)
// Shakllar supabase/migrations/011_jihozlar.sql jadval/view'lariga mos.
// Zaxira: lib/jihoz-fallback.js (~350 KB, generatsiya qilingan) — faqat kerak bo'lganda yuklanadi.
// =========================================================
async function jihozZaxira(nomi, jadval) {
  belgila(jadval);
  const m = await import('./jihoz-fallback');
  return m[nomi];
}

// Hudud kesimida: { hudud, muassasa, tuman_soni, jami, soz, nosoz, yaroqsiz }
export async function getJihozHududStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('jihoz_hudud_stat').select('*').order('jami', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return jihozZaxira('INITIAL_JIHOZ_HUDUD_STAT', 'jihoz_hudud_stat');
}

// Tuman/shahar kesimida: { hudud, tuman, muassasa, jami, soz, nosoz, yaroqsiz }
export async function getJihozTumanStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('jihoz_tuman_stat')
      .select('*')
      .order('hudud')
      .order('jami', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return jihozZaxira('INITIAL_JIHOZ_TUMAN_STAT', 'jihoz_tuman_stat');
}

// Muassasa turi kesimida: { turi, muassasa, jami, soz, nosoz, yaroqsiz }
export async function getJihozTuriStat() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('jihoz_turi_stat').select('*').order('jami', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return jihozZaxira('INITIAL_JIHOZ_TURI_STAT', 'jihoz_turi_stat');
}

// Muassasalar ro'yxati (3 875 qator) — PostgREST max_rows=1000, shuning uchun range() bilan bo'laklab olinadi.
// Bo'laklardan birortasi xato bersa to'liq zaxiraga o'tiladi (qisman ro'yxat ko'rsatilmaydi).
export async function getJihozMuassasalar() {
  const HAJM = 1000;
  try {
    const supabase = createClient();
    const hammasi = [];
    for (let boshi = 0; ; boshi += HAJM) {
      const { data, error } = await supabase
        .from('jihoz_muassasa')
        .select('id,hudud,tuman,nomi,turi,jami,soz,nosoz,yaroqsiz')
        .order('id')
        .range(boshi, boshi + HAJM - 1);
      if (error) throw error;
      hammasi.push(...(data || []));
      if (!data || data.length < HAJM) break;
    }
    if (hammasi.length > 0) return hammasi;
  } catch {
    // pastdagi zaxiraga o'tamiz
  }
  return jihozZaxira('INITIAL_JIHOZ_MUASSASA', 'jihoz_muassasa');
}
