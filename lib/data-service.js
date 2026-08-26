import { createClient } from './supabase/client';

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
    yonalish_kodi: '70910201',
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
    yonalish_kodi: '70910218',
    ish_joyi: 'Samarqand shahar 1-son bolalar shifoxonasi',
    lavozimi: 'Pediatr vrach-ordinator',
    rol: 'xodim',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    fish: 'Sodiqov Dilshod Mirzayevich',
    jshshir: '31502863920045',
    tug_ilgan_sana: '1982-11-05',
    jinsi: 'erkak',
    telefon: '+998 97 789 01 23',
    email: 'vazirlik@ssv.uz',
    manzil_viloyat_id: 'toshkent-shahar',
    manzil_tuman: 'Yunusobod',
    hozirgi_bosqich: 'doktarantura',
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
    yonalish_kodi: '70910220',
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
    return INITIAL_EDUCATION.filter((e) => e.profile_id === profileId);
  }
}

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
    return INITIAL_LICENSES.map((l) => ({ ...l, holati: litsenziyaHolati(l.amal_qilish_muddati) }));
  }
}

// ---- Klassifikator: yo'nalishlar ro'yxati ----
export async function getYonalishlar() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('specializations')
      .select('kodi,nomi,bosqich')
      .order('kodi');
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

// Helper: fetch all profiles (from Supabase or fallback)
export async function getProfiles() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_PROFILES;
    return data;
  } catch {
    return INITIAL_PROFILES;
  }
}

// Helper: get profile by ID
export async function getProfileById(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error || !data) return INITIAL_PROFILES.find((p) => p.id === id) || INITIAL_PROFILES[0];
    return data;
  } catch {
    return INITIAL_PROFILES.find((p) => p.id === id) || INITIAL_PROFILES[0];
  }
}
