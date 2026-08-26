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

-- 3. Specializations (Bakalavriat, Magistratura, Ordinatura, Doktarantura)
INSERT INTO public.specializations (kodi, nomi, bosqich, turi) VALUES
-- Texnikum
('50910101', 'Hamshiralik ishi (umumiy amaliyot va patronaj)', 'texnikum', 'hamshiralik'),
('50910201', 'Davolash ishi (feldsherlik)', 'texnikum', 'terapevtik'),
('50910301', 'Farmatsiya (farmatsevt assistenti)', 'texnikum', 'farmatsiya'),
('50910401', 'Tibbiy-laboratoriya ishi / Radiodiagnostika laboranti', 'texnikum', 'laboratoriya'),
('50910501', 'Stomatologiya ishi (tish texnigi)', 'texnikum', 'stomatologiya'),

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

-- Magistratura
('70910201', 'Kardiologiya', 'magistratura', 'terapevtik'),
('70910202', 'Endokrinologiya', 'magistratura', 'terapevtik'),
('70910203', 'Terapiya (Ichki kasalliklar)', 'magistratura', 'terapevtik'),
('70910204', 'Otorinolaringologiya (LOR)', 'magistratura', 'jarrohlik'),
('70910205', 'Nevrologiya', 'magistratura', 'terapevtik'),
('70910206', 'Gastroenterologiya', 'magistratura', 'terapevtik'),
('70910207', 'Nefrologiya', 'magistratura', 'terapevtik'),
('70910208', 'Pulmonologiya', 'magistratura', 'terapevtik'),
('70910209', 'Revmatologiya', 'magistratura', 'terapevtik'),
('70910210', 'Gematologiya', 'magistratura', 'terapevtik'),
('70910211', 'Infeksion kasalliklar', 'magistratura', 'terapevtik'),
('70910212', 'Dermatovenerologiya', 'magistratura', 'terapevtik'),
('70910213', 'Psixiatriya va narkologiya', 'magistratura', 'terapevtik'),
('70910214', 'Onkologiya', 'magistratura', 'jarrohlik'),
('70910215', 'Radiologiya va nur diagnostikasi', 'magistratura', 'diagnostika'),
('70910216', 'Anesteziologiya va reanimatologiya', 'magistratura', 'jarrohlik'),
('70910217', 'Akusherlik va ginekologiya', 'magistratura', 'jarrohlik'),
('70910218', 'Pediatriya', 'magistratura', 'pediatriya'),
('70910219', 'Neonatologiya', 'magistratura', 'pediatriya'),
('70910220', 'Umumiy xirurgiya', 'magistratura', 'jarrohlik'),
('70910221', 'Travmatologiya va ortopediya', 'magistratura', 'jarrohlik'),
('70910222', 'Urologiya', 'magistratura', 'jarrohlik'),
('70910223', 'Oftalmologiya', 'magistratura', 'jarrohlik'),
('70910224', 'Patologik anatomiya', 'magistratura', 'fundamental'),
('70910225', 'Sud-tibbiy ekspertiza', 'magistratura', 'fundamental'),
('70910226', 'Oilaviy tibbiyot', 'magistratura', 'terapevtik'),

-- Doktarantura (OAK Ixtisosliklari)
('14.00.01', 'Akusherlik va ginekologiya', 'doktarantura', 'jarrohlik'),
('14.00.02', 'Morfologiya (Anatomiya, gistologiya)', 'doktarantura', 'fundamental'),
('14.00.03', 'Endokrinologiya', 'doktarantura', 'terapevtik'),
('14.00.04', 'Otorinolaringologiya', 'doktarantura', 'jarrohlik'),
('14.00.05', 'Ichki kasalliklar (Terapiya)', 'doktarantura', 'terapevtik'),
('14.00.06', 'Kardiologiya', 'doktarantura', 'terapevtik'),
('14.00.08', 'Oftalmologiya', 'doktarantura', 'jarrohlik'),
('14.00.09', 'Pediatriya', 'doktarantura', 'pediatriya'),
('14.00.14', 'Onkologiya', 'doktarantura', 'jarrohlik'),
('14.00.15', 'Patologik anatomiya', 'doktarantura', 'fundamental'),
('14.00.16', 'Patologik fiziologiya', 'doktarantura', 'fundamental'),
('14.00.17', 'Farmakologiya va klinik farmakologiya', 'doktarantura', 'fundamental'),
('14.00.21', 'Stomatologiya', 'doktarantura', 'stomatologiya'),
('14.00.22', 'Travmatologiya va ortopediya', 'doktarantura', 'jarrohlik'),
('14.00.27', 'Jarrohlik', 'doktarantura', 'jarrohlik'),
('14.00.30', 'Epidemiologiya', 'doktarantura', 'profilaktika'),
('14.00.33', 'Jamoat salomatligi va sog‘liqni saqlashni boshqarish', 'doktarantura', 'boshqaruv'),
('14.00.37', 'Anesteziologiya va reanimatologiya', 'doktarantura', 'jarrohlik')
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
 'Respublika ixtisoslashtirilgan Kardiologiya markazi', 5, '70910201',
 'Respublika ixtisoslashtirilgan Kardiologiya markazi', 'Kardiolog-shifokor', 'xodim'),
('22222222-2222-2222-2222-222222222222', 'Karimova Shahlo Botirovna', '41208942910023', '1994-09-20', 'ayol',
 '+998 93 456 78 90', 'shahlo.k@ssv.uz', 'samarqand', 'Samarqand shahri', 'magistr',
 'Samarqand davlat tibbiyot universiteti', 2, '70910218',
 'Samarqand shahar 1-son bolalar shifoxonasi', 'Pediatr vrach-ordinator', 'xodim'),
('33333333-3333-3333-3333-333333333333', 'Sodiqov Dilshod Mirzayevich', '31502863920045', '1982-11-05', 'erkak',
 '+998 97 789 01 23', 'vazirlik@ssv.uz', 'toshkent-shahar', 'Yunusobod', 'doktarantura',
 'Toshkent tibbiyot akademiyasi', 3, '14.00.33',
 'Sog''liqni saqlash vazirligi', 'Bosh mutaxassis / Inspektor', 'vazirlik'),
('44444444-4444-4444-4444-444444444444', 'Azizov Bekzod Rustamovich', '30204912830056', '1991-03-15', 'erkak',
 '+998 99 333 44 55', 'admin@ssv.uz', 'andijon', 'Asaka', 'doktor',
 'Andijon davlat tibbiyot instituti', 4, '70910220',
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
-- Sodiqov Dilshod (vazirlik, doktarantura)
('33333333-3333-3333-3333-333333333333', 'bakalavr', 'Toshkent tibbiyot akademiyasi', 'Tibbiy profilaktika ishi', 2000, 2006, 'B 0912345', '2006-06-20', 'tamomlagan'),
('33333333-3333-3333-3333-333333333333', 'magistr', 'Toshkent tibbiyot akademiyasi', 'Jamoat salomatligi', 2006, 2009, 'M 0128900', '2009-06-30', 'tamomlagan'),
('33333333-3333-3333-3333-333333333333', 'doktarantura', 'Toshkent tibbiyot akademiyasi', 'Jamoat salomatligi va sog''liqni saqlashni boshqarish', 2024, NULL, NULL, NULL, 'oqimoqda');

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
