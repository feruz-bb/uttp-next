// Kimyo-biologiya chuqurlashtirilgan sinf o'quvchisi uchun REAL ma'lumotlar.
// Manbalar rasmiy hujjatlar va matbuotdan (2026-08-27 holatiga tekshirilgan):
//  - PQ-4805 (12.08.2020) — kimyo-biologiya uzluksiz ta'limi: lex.uz/uz/docs/-4945470
//  - PQ-4666 (07.04.2020) — tibbiy-sanitariya kadrlar, texnikumlar: lex.uz/acts/-4782939
//  - Milliy sertifikat imtiyozi: yuz.uz, abt.uz

export const HUQUQIY_ASOS = [
  {
    hujjat: 'PQ-4805',
    sana: '12.08.2020',
    nomi: 'Kimyo va biologiya yo‘nalishlarida uzluksiz ta’lim sifatini va ilm-fan natijadorligini oshirish chora-tadbirlari',
    mazmun: 'Tuman va shahar markazlarida kimyo-biologiya fanlarini chuqurlashtirib o‘qitishga ixtisoslashtirilgan 150 ta maktab hamda har viloyatda tayanch ixtisoslashtirilgan maktablar (14 ta) tashkil etildi.',
    url: 'https://lex.uz/uz/docs/-4945470',
  },
  {
    hujjat: 'PQ-4666',
    sana: '07.04.2020',
    nomi: 'Tibbiy-sanitariya sohasida kadrlarni tayyorlash va uzluksiz kasbiy rivojlantirish tizimini takomillashtirish',
    mazmun: '47 ta tibbiyot kolleji Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumlariga aylantirildi; texnikumni muvaffaqiyatli bitirganlar suhbat orqali OTMning 2-kursidan o‘qishni davom ettirishi mumkin.',
    url: 'https://lex.uz/acts/-4782939',
  },
];

// Milliy sertifikat (kimyo/biologiya) — OTMga kirishdagi imtiyozlar
export const MILLIY_SERTIFIKAT = {
  imtiyoz: 'Kimyo yoki biologiya bo‘yicha milliy sertifikatga ega abituriyent OTMga kirishda shu fan testidan ozod etiladi',
  ballar: 'A+ va A daraja — fan uchun maksimal ball; B+, B, C+, C — proporsional ball',
  muddat: 'Sertifikat 3 yil amal qiladi',
  tibbiyot: 'Kimyo va biologiyadan sertifikati bor abituriyent tibbiyot yo‘nalishida faqat majburiy blok testlarini ishlaydi',
  manba: 'https://yuz.uz/uz/news/kimyo-va-biologiya-boyicha-milliy-sertifikatga-ega-oquvchilar-otmga-kirishda-testdan-ozod-boladi',
};

// O'quvchining tibbiyotgacha bo'lgan yo'li — real imkoniyatlar zanjiri
export const KELAJAK_YOLI = [
  {
    bosqich: 'Milliy sertifikat',
    tavsif: 'Maktabni tugatguncha kimyo va biologiyadan milliy sertifikat olish — OTM testidan ozod qiladi (3 yil amalda)',
    badge: 'Imtiyoz',
    tone: 'success',
  },
  {
    bosqich: 'Jamoat salomatligi texnikumi',
    tavsif: '74 ta davlat Abu Ali ibn Sino texnikumidan biri — bitirgach suhbat orqali tibbiyot OTMining 2-kursiga imtihonsiz o‘tish (PQ-4666)',
    badge: '74 ta',
    tone: 'info',
  },
  {
    bosqich: 'Tibbiyot bakalavriati',
    tavsif: 'DTM test (kimyo-biologiya bloki) yoki milliy sertifikat imtiyozi bilan; davolash ishi — 6 yil, stomatologiya — 5 yil; maqsadli qabul hudud ehtiyojidan kelib chiqib shakllantiriladi',
    badge: 'DTM',
    tone: 'violet',
  },
];

// Ixtisoslashtirilgan maktablar tarmog'i haqida faktlar
export const MAKTAB_FAKTLAR = [
  { label: 'Kimyo-biologiya ixtisoslashtirilgan maktablar', qiymat: '150 ta', izoh: 'tuman va shahar markazlarida (PQ-4805)' },
  { label: 'Tayanch ixtisoslashtirilgan maktablar', qiymat: '14 ta', izoh: 'har bir hududda bittadan' },
  { label: 'Abu Ali ibn Sino maktabiga qabul', qiymat: '7-sinfdan', izoh: 'tanlov asosida, sinfda ko‘pi bilan 24 o‘quvchi (PIIMA)' },
  { label: 'Ariza topshirish', qiymat: 'Onlayn', izoh: 'ariza.piima.uz orqali (odatda 1–20 iyun)' },
];

export const CHUQUR_FANLAR = [
  { fan: 'Kimyo', izoh: 'Chuqurlashtirilgan dastur + laboratoriya amaliyoti' },
  { fan: 'Biologiya', izoh: 'Chuqurlashtirilgan dastur + laboratoriya amaliyoti' },
];
