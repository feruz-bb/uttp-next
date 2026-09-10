-- =========================================================
-- UTTP Platform — Seed Data
-- 14 Regions & Districts, Specializations Classifier
-- =========================================================

-- 1. Regions (Viloyatlar)
INSERT INTO public.regions (id, nomi, markaz) VALUES
('qoraqalpogiston', 'Qoraqalpog‘iston Respublikasi', 'Nukus'),
('andijon', 'Andijon viloyati', 'Andijon'),
('buxoro', 'Buxoro viloyati', 'Buxoro'),
('jizzax', 'Jizzax viloyati', 'Jizzax'),
('qashqadaryo', 'Qashqadaryo viloyati', 'Qarshi'),
('navoiy', 'Navoiy viloyati', 'Navoiy'),
('namangan', 'Namangan viloyati', 'Namangan'),
('samarqand', 'Samarqand viloyati', 'Samarqand'),
('surxondaryo', 'Surxondaryo viloyati', 'Termiz'),
('sirdaryo', 'Sirdaryo viloyati', 'Guliston'),
('toshkent-viloyat', 'Toshkent viloyati', 'Nurafshon'),
('fargona', 'Farg‘ona viloyati', 'Farg‘ona'),
('xorazm', 'Xorazm viloyati', 'Urganch'),
('toshkent-shahar', 'Toshkent shahri', 'Toshkent')
ON CONFLICT (id) DO NOTHING;

-- 2. Districts (Tumanlar va shaharlar)
INSERT INTO public.districts (region_id, nomi) VALUES
('qoraqalpogiston', 'Nukus shahri'), ('qoraqalpogiston', 'Nukus tumani'), ('qoraqalpogiston', 'Amudaryo'), ('qoraqalpogiston', 'Beruniy'), ('qoraqalpogiston', 'Chimboy'), ('qoraqalpogiston', 'Qo‘ng‘irot'), ('qoraqalpogiston', 'To‘rtko‘l'), ('qoraqalpogiston', 'Xo‘jayli'),
('andijon', 'Andijon shahri'), ('andijon', 'Andijon tumani'), ('andijon', 'Asaka'), ('andijon', 'Baliqchi'), ('andijon', 'Buloqboshi'), ('andijon', 'Izboskan'), ('andijon', 'Shahrixon'), ('andijon', 'Xo‘jaobod'),
('buxoro', 'Buxoro shahri'), ('buxoro', 'Buxoro tumani'), ('buxoro', 'G‘ijduvon'), ('buxoro', 'Jondor'), ('buxoro', 'Kogon shahri'), ('buxoro', 'Qorako‘l'), ('buxoro', 'Romitan'), ('buxoro', 'Shofirkon'),
('jizzax', 'Jizzax shahri'), ('jizzax', 'Arnasoy'), ('jizzax', 'Baxmal'), ('jizzax', 'Do‘stlik'), ('jizzax', 'G‘allaorol'), ('jizzax', 'Paxtakor'), ('jizzax', 'Zomin'),
('qashqadaryo', 'Qarshi shahri'), ('qashqadaryo', 'Qarshi tumani'), ('qashqadaryo', 'Chiroqchi'), ('qashqadaryo', 'Dehqonobod'), ('qashqadaryo', 'G‘uzor'), ('qashqadaryo', 'Koson'), ('qashqadaryo', 'Shahrisabz shahri'), ('qashqadaryo', 'Yakkabog‘'),
('navoiy', 'Navoiy shahri'), ('navoiy', 'Zarafshon shahri'), ('navoiy', 'Karmana'), ('navoiy', 'Konimex'), ('navoiy', 'Qiziltepa'), ('navoiy', 'Uchquduq'), ('navoiy', 'Xatirchi'),
('namangan', 'Namangan shahri'), ('namangan', 'Namangan tumani'), ('namangan', 'Chust'), ('namangan', 'Chortoq'), ('namangan', 'Kosonsoy'), ('namangan', 'Pop'), ('namangan', 'To‘raqo‘rg‘on'), ('namangan', 'Uychi'),
('samarqand', 'Samarqand shahri'), ('samarqand', 'Samarqand tumani'), ('samarqand', 'Bulung‘ur'), ('samarqand', 'Ishtixon'), ('samarqand', 'Jomboy'), ('samarqand', 'Kattaqo‘rg‘on shahri'), ('samarqand', 'Pastdarg‘om'), ('samarqand', 'Urgut'),
('surxondaryo', 'Termiz shahri'), ('surxondaryo', 'Termiz tumani'), ('surxondaryo', 'Boysun'), ('surxondaryo', 'Denov'), ('surxondaryo', 'Jarqo‘rg‘on'), ('surxondaryo', 'Qumqo‘rg‘on'), ('surxondaryo', 'Sherobod'), ('surxondaryo', 'Sho‘rchi'),
('sirdaryo', 'Guliston shahri'), ('sirdaryo', 'Guliston tumani'), ('sirdaryo', 'Boyovut'), ('sirdaryo', 'Mirzaobod'), ('sirdaryo', 'Sardoba'), ('sirdaryo', 'Sayxunobod'), ('sirdaryo', 'Yangiyer shahri'),
('toshkent-viloyat', 'Nurafshon shahri'), ('toshkent-viloyat', 'Angren shahri'), ('toshkent-viloyat', 'Bekobod shahri'), ('toshkent-viloyat', 'Chirchiq shahri'), ('toshkent-viloyat', 'Olmaliq shahri'), ('toshkent-viloyat', 'Bo‘stonliq'), ('toshkent-viloyat', 'Qibray'), ('toshkent-viloyat', 'Zangiota'),
('fargona', 'Farg‘ona shahri'), ('fargona', 'Marg‘ilon shahri'), ('fargona', 'Qo‘qon shahri'), ('fargona', 'Quvasoy shahri'), ('fargona', 'Beshariq'), ('fargona', 'Oltiariq'), ('fargona', 'Rishton'), ('fargona', 'Uchko‘prik'),
('xorazm', 'Urganch shahri'), ('xorazm', 'Urganch tumani'), ('xorazm', 'Bog‘ot'), ('xorazm', 'Gurlan'), ('xorazm', 'Hazorasp'), ('xorazm', 'Xiva shahri'), ('xorazm', 'Xonqa'),
('toshkent-shahar', 'Chilonzor'), ('toshkent-shahar', 'Mirobod'), ('toshkent-shahar', 'Mirzo Ulug‘bek'), ('toshkent-shahar', 'Olmazor'), ('toshkent-shahar', 'Sergeli'), ('toshkent-shahar', 'Shayxontohur'), ('toshkent-shahar', 'Uchtepa'), ('toshkent-shahar', 'Yakkasaroy'), ('toshkent-shahar', 'Yashnobod'), ('toshkent-shahar', 'Yunusobod');

-- 3. Specializations (Bakalavriat, Magistratura, Ordinatura, Doktorantura)
INSERT INTO public.specializations (kodi, nomi, bosqich, turi) VALUES
-- Texnikum — shifrlar docs/Texnikumlar_viloyatlar_kesimida_2026 (1).xlsx
-- kvota jadvallaridan olingan (muassasalar topshirgan real dastur shifrlari)
('50910203', 'Hamshiralik ishi', 'texnikum', 'hamshiralik'),
('50910204', 'Davolash ishi (feldsherlik)', 'texnikum', 'terapevtik'),
('50910205', 'Funksional diagnostika ishi', 'texnikum', 'diagnostika'),
('50910206', 'Tibbiy radiologiya ishi', 'texnikum', 'laboratoriya'),
('50910102', 'Stomatologiya ishi', 'texnikum', 'stomatologiya'),
('50910401', 'Farmatsiya', 'texnikum', 'farmatsiya'),
('50910403', 'Sanoat farmatsiyasi', 'texnikum', 'farmatsiya'),
('40910206', 'Tibbiyot brigadasi hamshirasi', 'texnikum', 'hamshiralik'),
('40910302', 'Tibbiy profilaktika ishi', 'texnikum', 'profilaktika'),
('40920102', 'Tibbiy-ijtimoiy ish', 'texnikum', 'ijtimoiy'),

-- Bakalavriat
('60910100', 'Stomatologiya', 'bakalavriat', 'stomatologiya'),
('60910200', 'Davolash ishi (Umumiy tibbiyot)', 'bakalavriat', 'terapevtik'),
('60910300', 'Pediatriya ishi', 'bakalavriat', 'pediatriya'),
('60910400', 'Tibbiy profilaktika ishi', 'bakalavriat', 'profilaktika'),
('60910600', 'Tibbiy-biologik ish', 'bakalavriat', 'fundamental'),
('60910700', 'Fundamental tibbiyot', 'bakalavriat', 'fundamental'),
('60910800', 'Farmatsiya', 'bakalavriat', 'farmatsiya'),
('60911100', 'Xalq tabobati', 'bakalavriat', 'xalq_tabobati'),
('60911200', 'Oliy hamshiralik ishi (OMH)', 'bakalavriat', 'hamshiralik'),

-- Magistratura — REAL shifrlar: docs/magistr_TDTU_2_3_kurs.xlsx (42 shifr, nomlar TDTU ro'yxatidan;
-- eski taxminiy ro'yxat 2026-09-06 da almashtirildi; scripts/gen_talaba.py KOD_NOMI bilan sinxron)
('70530507', 'Tibbiyot fizikasi', 'magistratura', 'fundamental'),
('70910101', 'Stomatologiya', 'magistratura', 'stomatologiya'),
('70910102', 'Yuz-jag‘ xirurgiyasi', 'magistratura', 'stomatologiya'),
('70910201', 'Akusherlik va ginekologiya', 'magistratura', 'jarrohlik'),
('70910202', 'Endokrinologiya', 'magistratura', 'terapevtik'),
('70910203', 'Terapiya', 'magistratura', 'terapevtik'),
('70910204', 'Otorinolaringologiya', 'magistratura', 'jarrohlik'),
('70910205', 'Kardiologiya', 'magistratura', 'terapevtik'),
('70910206', 'Oftalmologiya', 'magistratura', 'jarrohlik'),
('70910207', 'Yuqumli kasalliklar', 'magistratura', 'terapevtik'),
('70910208', 'Dermatovenerologiya', 'magistratura', 'terapevtik'),
('70910209', 'Nevrologiya', 'magistratura', 'terapevtik'),
('70910210', 'Umumiy onkologiya', 'magistratura', 'jarrohlik'),
('70910211', 'Psixiatriya', 'magistratura', 'terapevtik'),
('70910212', 'Xirurgiya', 'magistratura', 'jarrohlik'),
('70910214', 'Neyroxirurgiya', 'magistratura', 'jarrohlik'),
('70910215', 'Sogʻliqni saqlashni boshqarish va jamoat sogʻligini saqlash', 'magistratura', 'profilaktika'),
('70910217', 'Urologiya', 'magistratura', 'jarrohlik'),
('70910218', 'Morfologiya', 'magistratura', 'fundamental'),
('70910219', 'Narkologiya', 'magistratura', 'terapevtik'),
('70910220', 'Anesteziologiya va reanimatologiya', 'magistratura', 'jarrohlik'),
('70910221', 'Travmatologiya va ortopediya', 'magistratura', 'jarrohlik'),
('70910222', 'Sud-tibbiyot ekspertizasi', 'magistratura', 'fundamental'),
('70910223', 'Patologik anatomiya', 'magistratura', 'fundamental'),
('70910226', 'Gematologiya va transfuziologiya', 'magistratura', 'terapevtik'),
('70910227', 'Tibbiy radiologiya', 'magistratura', 'diagnostika'),
('70910229', 'Plastik xirurgiya', 'magistratura', 'jarrohlik'),
('70910230', 'Tibbiy genetika', 'magistratura', 'fundamental'),
('70910231', 'Tibbiy sug‘urta ishi', 'magistratura', 'profilaktika'),
('70910234', 'Neyroreabilitologiya', 'magistratura', 'terapevtik'),
('70910301', 'Pediatriya', 'magistratura', 'pediatriya'),
('70910302', 'Bolalar xirurgiyasi', 'magistratura', 'pediatriya'),
('70910303', 'Bolalar anesteziologiyasi va reanimatologiyasi', 'magistratura', 'pediatriya'),
('70910304', 'Bolalar kardiologiyasi va revmatologiyasi', 'magistratura', 'pediatriya'),
('70910305', 'Bolalar nevrologiyasi', 'magistratura', 'pediatriya'),
('70910306', 'Neonatologiya', 'magistratura', 'pediatriya'),
('70910307', 'Bolalar va o‘smirlar ginekologiyasi', 'magistratura', 'pediatriya'),
('70910308', 'Bolalar gastroenterologiyasi', 'magistratura', 'pediatriya'),
('70910401', 'Gigiyena', 'magistratura', 'profilaktika'),
('70910402', 'Atrof-muhit va inson salomatligi', 'magistratura', 'profilaktika'),
('70910701', 'Laboratoriya ishi', 'magistratura', 'laboratoriya'),
('70911201', 'Oliy hamshiralik ishini tashkil qilish va boshqarish', 'magistratura', 'hamshiralik'),

-- Doktorantura (OAK Ixtisosliklari) — REAL shifrlar: docs/doktarantlar_tayanch_doktarant.xlsx (35) + seed'dagi 2 ta (14.00.16, 14.00.37);
-- 2026-09-06 da birlashtirildi; scripts/gen_doktorant.py KOD_NOMI bilan sinxron
('03.00.01', 'Biokimyo', 'doktorantura', 'fundamental'),
('03.00.02', 'Biofizika va radiobiologiya', 'doktorantura', 'fundamental'),
('03.00.04', 'Mikrobiologiya va virusologiya', 'doktorantura', 'fundamental'),
('13.00.02', 'Ta’lim va tarbiya nazariyasi va metodikasi (sohalar boʻyicha)', 'doktorantura', 'pedagogika'),
('14.00.01', 'Akusherlik va ginekologiya', 'doktorantura', 'jarrohlik'),
('14.00.02', 'Morfologiya', 'doktorantura', 'fundamental'),
('14.00.03', 'Endokrinologiya', 'doktorantura', 'terapevtik'),
('14.00.04', 'Otorinolaringologiya', 'doktorantura', 'jarrohlik'),
('14.00.05', 'Ichki kasalliklar', 'doktorantura', 'terapevtik'),
('14.00.06', 'Kardiologiya', 'doktorantura', 'terapevtik'),
('14.00.07', 'Gigiyena', 'doktorantura', 'profilaktika'),
('14.00.08', 'Oftalmologiya', 'doktorantura', 'jarrohlik'),
('14.00.09', 'Pediatriya', 'doktorantura', 'pediatriya'),
('14.00.10', 'Yuqumli kasalliklar', 'doktorantura', 'terapevtik'),
('14.00.11', 'Dermatologiya va venerologiya', 'doktorantura', 'terapevtik'),
('14.00.13', 'Nevrologiya', 'doktorantura', 'terapevtik'),
('14.00.14', 'Onkologiya', 'doktorantura', 'jarrohlik'),
('14.00.15', 'Patologik anatomiya', 'doktorantura', 'fundamental'),
('14.00.16', 'Patologik fiziologiya', 'doktorantura', 'fundamental'),
('14.00.17', 'Farmakologiya va klinik farmakologiya', 'doktorantura', 'fundamental'),
('14.00.18', 'Psixiatriya va narkologiya', 'doktorantura', 'terapevtik'),
('14.00.19', 'Klinik radiologiya', 'doktorantura', 'diagnostika'),
('14.00.20', 'Tibbiy genetika', 'doktorantura', 'fundamental'),
('14.00.21', 'Stomatologiya', 'doktorantura', 'stomatologiya'),
('14.00.22', 'Travmatologiya va ortopediya', 'doktorantura', 'jarrohlik'),
('14.00.23', 'Hamshiralik ishini tashkil etish', 'doktorantura', 'hamshiralik'),
('14.00.24', 'Sud tibbiyoti', 'doktorantura', 'fundamental'),
('14.00.25', 'Klinik-laborator va funksional diagnostika', 'doktorantura', 'diagnostika'),
('14.00.27', 'Xirurgiya', 'doktorantura', 'jarrohlik'),
('14.00.29', 'Gematologiya va transfuziologiya', 'doktorantura', 'terapevtik'),
('14.00.30', 'Epidemiologiya', 'doktorantura', 'profilaktika'),
('14.00.31', 'Urologiya', 'doktorantura', 'jarrohlik'),
('14.00.33', 'Jamiyat salomatligi. Sogʻliqni saqlashda menejment', 'doktorantura', 'boshqaruv'),
('14.00.35', 'Bolalar xirurgiyasi', 'doktorantura', 'pediatriya'),
('14.00.36', 'Allergologiya va immunologiya', 'doktorantura', 'terapevtik'),
('14.00.37', 'Anesteziologiya va reanimatologiya', 'doktorantura', 'jarrohlik'),
('19.00.04', 'Tibbiy va maxsus psixologiya', 'doktorantura', 'fundamental')
ON CONFLICT (kodi) DO NOTHING;

-- =========================================================
-- 4. Demo auth users (lokal muhit uchun)
--    Parollar: <ism>2026 (masalan jamshid2026)
-- =========================================================
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current, is_super_admin
) VALUES
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
 'jamshid.r@ssv.uz', extensions.crypt('jamshid2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
 'shahlo.k@ssv.uz', extensions.crypt('shahlo2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
 'vazirlik@ssv.uz', extensions.crypt('vazirlik2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated',
 'admin@ssv.uz', extensions.crypt('admin2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
)
SELECT u.id, u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
       'email', NOW(), NOW(), NOW()
FROM auth.users u
WHERE u.id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444'
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- =========================================================
-- 5. Demo profillar
-- =========================================================
INSERT INTO public.profiles (
    id, fish, jshshir, tug_ilgan_sana, jinsi, telefon, email,
    manzil_viloyat_id, manzil_tuman, hozirgi_bosqich, hozirgi_muassasa,
    hozirgi_kurs, yonalish_kodi, ish_joyi, lavozimi, rol
) VALUES
('11111111-1111-1111-1111-111111111111', 'Rahimov Jamshid Anvarovich', '32405921820014', '1988-04-12', 'erkak',
 '+998 90 123 45 67', 'jamshid.r@ssv.uz', 'toshkent-shahar', 'Chilonzor', 'doktor',
 'Respublika ixtisoslashtirilgan Kardiologiya markazi', 5, '70910205',
 'Respublika ixtisoslashtirilgan Kardiologiya markazi', 'Kardiolog-shifokor', 'xodim'),
('22222222-2222-2222-2222-222222222222', 'Karimova Shahlo Botirovna', '41208942910023', '1994-09-20', 'ayol',
 '+998 93 456 78 90', 'shahlo.k@ssv.uz', 'samarqand', 'Samarqand shahri', 'magistr',
 'Samarqand davlat tibbiyot universiteti', 2, '70910301',
 'Samarqand shahar 1-son bolalar shifoxonasi', 'Pediatr vrach-ordinator', 'xodim'),
('33333333-3333-3333-3333-333333333333', 'SSV', '31502863920045', '1982-11-05', 'erkak',
 '+998 97 789 01 23', 'vazirlik@ssv.uz', 'toshkent-shahar', 'Yunusobod', 'doktorantura',
 'Toshkent tibbiyot akademiyasi', 3, '14.00.33',
 'Sog''liqni saqlash vazirligi', 'Bosh mutaxassis / Inspektor', 'vazirlik'),
('44444444-4444-4444-4444-444444444444', 'Azizov Bekzod Rustamovich', '30204912830056', '1991-03-15', 'erkak',
 '+998 99 333 44 55', 'admin@ssv.uz', 'andijon', 'Asaka', 'doktor',
 'Andijon davlat tibbiyot instituti', 4, '70910212',
 'Asaka tumani markaziy shifoxonasi', 'Tizim administratori', 'admin')
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 6. Demo ta'lim tarixi (bosqichma-bosqich)
-- =========================================================
INSERT INTO public.education_history
    (profile_id, bosqich, muassasa_nomi, yonalish_nomi, boshlangan_yil, tugatilgan_yil, diplom_raqami, diplom_sanasi, holati)
VALUES
-- Rahimov Jamshid (kardiolog)
('11111111-1111-1111-1111-111111111111', 'bakalavr', 'Toshkent tibbiyot akademiyasi', 'Davolash ishi (Umumiy tibbiyot)', 2006, 2012, 'B 1284561', '2012-06-25', 'tamomlagan'),
('11111111-1111-1111-1111-111111111111', 'magistr', 'Toshkent tibbiyot akademiyasi', 'Kardiologiya', 2012, 2015, 'M 0447812', '2015-06-30', 'tamomlagan'),
-- Karimova Shahlo (pediatr, hozir magistratura 2-kurs)
('22222222-2222-2222-2222-222222222222', 'bakalavr', 'Samarqand davlat tibbiyot universiteti', 'Pediatriya ishi', 2012, 2018, 'B 2201473', '2018-06-28', 'tamomlagan'),
('22222222-2222-2222-2222-222222222222', 'magistr', 'Samarqand davlat tibbiyot universiteti', 'Pediatriya', 2025, NULL, NULL, NULL, 'oqimoqda'),
-- SSV (vazirlik hisobi — shaxs nomi emas, tashkilot; doktorantura)
('33333333-3333-3333-3333-333333333333', 'bakalavr', 'Toshkent tibbiyot akademiyasi', 'Tibbiy profilaktika ishi', 2000, 2006, 'B 0912345', '2006-06-20', 'tamomlagan'),
('33333333-3333-3333-3333-333333333333', 'magistr', 'Toshkent tibbiyot akademiyasi', 'Jamoat salomatligi', 2006, 2009, 'M 0128900', '2009-06-30', 'tamomlagan'),
('33333333-3333-3333-3333-333333333333', 'doktorantura', 'Toshkent tibbiyot akademiyasi', 'Jamoat salomatligi va sog''liqni saqlashni boshqarish', 2024, NULL, NULL, NULL, 'oqimoqda');

-- =========================================================
-- 7. Demo litsenziyalar (TFX)
-- =========================================================
INSERT INTO public.licenses (profile_id, tfx_raqami, mutaxassislik, berilgan_sana, amal_qilish_muddati, toifa)
VALUES
('11111111-1111-1111-1111-111111111111', 'TFX-2024-88912', 'Kardiologiya', '2024-02-10', '2029-02-10', 'oliy'),
('22222222-2222-2222-2222-222222222222', 'TFX-2021-44510', 'Pediatriya', '2021-08-15', '2026-08-15', 'birinchi');

-- =========================================================
-- 8. Demo UKTT kreditlari
-- =========================================================
INSERT INTO public.uktt_credits (profile_id, kurs_nomi, tashkilot_nomi, kredit_ball, sertifikat_raqami, topshirilgan_sana)
VALUES
('11111111-1111-1111-1111-111111111111', 'Zamonaviy kardiologik reanimatsiya va EKG tahlili', 'TIPME', 36, 'TIPME-CR-2025-01', '2025-11-20'),
('11111111-1111-1111-1111-111111111111', 'Yurak yetishmovchiligida farmakoterapiya', 'TIPME', 24, 'TIPME-CR-2026-14', '2026-04-10'),
('22222222-2222-2222-2222-222222222222', 'Neonatal skrining va erta tashxis', 'TIPME', 18, 'TIPME-CR-2026-33', '2026-02-05');

-- =========================================================
-- 9. Ta'lim zanjiri demo-xodimlari — har bosqichdan bittadan
--    (jami 7: 2 tasi yuqorida — Jamshid=doktor, Shahlo=magistr)
--    Parol konvensiyasi: <ism>2026
-- =========================================================
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current, is_super_admin
) VALUES
('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated',
 'madina.y@ssv.uz', extensions.crypt('madina2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'authenticated', 'authenticated',
 'aziz.q@ssv.uz', extensions.crypt('aziz2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'authenticated', 'authenticated',
 'nilufar.e@ssv.uz', extensions.crypt('nilufar2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '88888888-8888-8888-8888-888888888888', 'authenticated', 'authenticated',
 'sardor.t@ssv.uz', extensions.crypt('sardor2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false),
('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated',
 'gulnora.m@ssv.uz', extensions.crypt('gulnora2026', extensions.gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '', '', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
)
SELECT u.id, u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
       'email', NOW(), NOW(), NOW()
FROM auth.users u
WHERE u.id IN (
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999'
)
ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO public.profiles (
    id, fish, jshshir, tug_ilgan_sana, jinsi, telefon, email,
    manzil_viloyat_id, manzil_tuman, hozirgi_bosqich, hozirgi_muassasa,
    hozirgi_kurs, yonalish_kodi, ish_joyi, lavozimi, rol
) VALUES
-- Chuqurlashtirilgan sinf o'quvchisi
('55555555-5555-5555-5555-555555555555', 'Yusupova Madina Baxtiyorovna', '61510092310017', '2009-10-15', 'ayol',
 '+998 88 210 33 44', 'madina.y@ssv.uz', 'namangan', 'Namangan shahri', 'chuqurlashtirilgan_sinf',
 'Namangan shahar kimyo-biologiya fanlariga ixtisoslashtirilgan 12-son maktab', 11, NULL,
 NULL, 'O''quvchi', 'xodim'),
-- Texnikum talabasi
('66666666-6666-6666-6666-666666666666', 'Qodirov Aziz Olimjonovich', '52107073820023', '2007-07-21', 'erkak',
 '+998 91 305 66 77', 'aziz.q@ssv.uz', 'buxoro', 'Buxoro shahri', 'texnikum',
 'Buxoro Abu Ali ibn Sino nomidagi Jamoat salomatligi texnikumi', 1, '50910204',
 NULL, 'Texnikum talabasi', 'xodim'),
-- Bakalavriat talabasi
('77777777-7777-7777-7777-777777777777', 'Ergasheva Nilufar Anvarovna', '42504052910031', '2004-04-25', 'ayol',
 '+998 94 412 55 88', 'nilufar.e@ssv.uz', 'andijon', 'Andijon shahri', 'bakalavr',
 'Andijon davlat tibbiyot instituti', 3, '60910200',
 NULL, 'Talaba', 'xodim'),
-- Rezidentura/ordinatura tinglovchisi
('88888888-8888-8888-8888-888888888888', 'Tursunov Sardor Rustamovich', '31201983740046', '1998-01-12', 'erkak',
 '+998 97 520 11 22', 'sardor.t@ssv.uz', 'toshkent-shahar', 'Shayxontohur', 'rezidentura',
 'Respublika shoshilinch tibbiy yordam ilmiy markazi', 2, '70910220',
 'Respublika shoshilinch tibbiy yordam ilmiy markazi', 'Vrach-ordinator', 'xodim'),
-- Doktorantura (PhD)
('99999999-9999-9999-9999-999999999999', 'Mirzayeva Gulnora Shavkatovna', '40903902820058', '1990-03-09', 'ayol',
 '+998 93 640 77 99', 'gulnora.m@ssv.uz', 'fargona', 'Farg''ona shahri', 'doktorantura',
 'Toshkent tibbiyot akademiyasi', 1, '14.00.09',
 'Farg''ona viloyati bolalar ko''p tarmoqli tibbiyot markazi', 'Pediatr, tayanch doktorant', 'xodim')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.education_history
    (profile_id, bosqich, muassasa_nomi, yonalish_nomi, boshlangan_yil, tugatilgan_yil, diplom_raqami, diplom_sanasi, holati)
VALUES
-- Madina: sinfda o'qimoqda
('55555555-5555-5555-5555-555555555555', 'chuqurlashtirilgan_sinf', 'Namangan shahar kimyo-biologiya fanlariga ixtisoslashtirilgan 12-son maktab', 'Kimyo-biologiya ixtisosligi (PQ-4805)', 2025, NULL, NULL, NULL, 'oqimoqda'),
-- Aziz: texnikumda o'qimoqda
('66666666-6666-6666-6666-666666666666', 'texnikum', 'Abu Ali ibn Sino jamoat salomatligi texnikumi (Buxoro)', 'Davolash ishi (feldsherlik)', 2025, NULL, NULL, NULL, 'oqimoqda'),
-- Nilufar: bakalavriat 3-kurs
('77777777-7777-7777-7777-777777777777', 'bakalavr', 'Andijon davlat tibbiyot instituti', 'Davolash ishi (Umumiy tibbiyot)', 2023, NULL, NULL, NULL, 'oqimoqda'),
-- Sardor: bakalavr tamomlagan + ordinaturada
('88888888-8888-8888-8888-888888888888', 'bakalavr', 'Toshkent tibbiyot akademiyasi', 'Davolash ishi (Umumiy tibbiyot)', 2017, 2023, 'B 3105274', '2023-06-27', 'tamomlagan'),
('88888888-8888-8888-8888-888888888888', 'rezidentura', 'Respublika shoshilinch tibbiy yordam ilmiy markazi', 'Anesteziologiya va reanimatologiya', 2024, NULL, NULL, NULL, 'oqimoqda'),
-- Gulnora: bakalavr + magistr tamomlagan, doktoranturada
('99999999-9999-9999-9999-999999999999', 'bakalavr', 'Toshkent pediatriya tibbiyot instituti', 'Pediatriya ishi', 2008, 2014, 'B 1902235', '2014-06-24', 'tamomlagan'),
('99999999-9999-9999-9999-999999999999', 'magistr', 'Toshkent pediatriya tibbiyot instituti', 'Pediatriya', 2014, 2017, 'M 0761190', '2017-06-29', 'tamomlagan'),
('99999999-9999-9999-9999-999999999999', 'doktorantura', 'Toshkent tibbiyot akademiyasi', 'Pediatriya (PhD)', 2025, NULL, NULL, NULL, 'oqimoqda');

-- Gulnora (amaliyotchi pediatr sifatida) UKTT kreditlari
INSERT INTO public.uktt_credits (profile_id, kurs_nomi, tashkilot_nomi, kredit_ball, sertifikat_raqami, topshirilgan_sana)
VALUES
('99999999-9999-9999-9999-999999999999', 'Bolalar reanimatsiyasida zamonaviy yondashuvlar', 'TIPME', 22, 'TIPME-CR-2026-41', '2026-03-14');
