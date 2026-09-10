-- =========================================================
-- UTTP Platform — Jamoat salomatligi texnikumlari statistikasi (2026)
-- Manba: docs/Texnikumlar_viloyatlar_kesimida_2026 (1).xlsx (14 hudud anketa yig'masi)
-- =========================================================

-- 1. Hudud kesimida agregat ko'rsatkichlar
CREATE TABLE IF NOT EXISTS public.texnikum_hudud_stat (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hudud TEXT NOT NULL UNIQUE,
    davlat INTEGER NOT NULL DEFAULT 0,          -- davlat texnikumlari soni
    nodavlat INTEGER NOT NULL DEFAULT 0,        -- nodavlat texnikumlari soni
    oquvchilar INTEGER NOT NULL DEFAULT 0,      -- umumiy o'quvchilar kontingenti
    ayollar INTEGER NOT NULL DEFAULT 0,
    davlat_granti INTEGER NOT NULL DEFAULT 0,
    kontrakt INTEGER NOT NULL DEFAULT 0,
    bitiruvchi INTEGER NOT NULL DEFAULT 0,      -- 2025/26 bitiruvchilar
    qabul_kvota INTEGER NOT NULL DEFAULT 0,     -- 2025 qabul kvotasi (davlat)
    pedagoglar INTEGER NOT NULL DEFAULT 0,
    vakant INTEGER NOT NULL DEFAULT 0,          -- vakant shtatlar
    kompyuterlar INTEGER NOT NULL DEFAULT 0,
    laboratoriyalar INTEGER NOT NULL DEFAULT 0,
    simulyatsion INTEGER NOT NULL DEFAULT 0,    -- simulyatsion xona/markazlar
    amaliy_baza INTEGER NOT NULL DEFAULT 0,     -- amaliy ta'lim/klinik bazalar
    anketa_tuliq INTEGER NOT NULL DEFAULT 0,    -- kontingent bo'limini topshirgan muassasalar
    yil INTEGER NOT NULL DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Muassasalardan kelib tushgan anketalar (10 bo'limlik so'rovnoma)
CREATE TABLE IF NOT EXISTS public.texnikum_anketa (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    muassasa TEXT NOT NULL,
    hudud TEXT NOT NULL,
    topshirilgan_sana DATE NOT NULL,
    bolimlar INTEGER NOT NULL DEFAULT 10,
    fayl TEXT,                                  -- manba fayl nomi
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: o'qish barcha authenticated foydalanuvchilarga, yozish faqat admin'ga
ALTER TABLE public.texnikum_hudud_stat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texnikum_anketa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read texnikum stat"
    ON public.texnikum_hudud_stat FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage texnikum stat"
    ON public.texnikum_hudud_stat FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Allow authenticated to read texnikum anketa"
    ON public.texnikum_anketa FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage texnikum anketa"
    ON public.texnikum_anketa FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- Data API GRANTlari (003 uslubida): o'qish authenticated'ga, CRUD RLS bilan cheklanadi
GRANT SELECT, INSERT, UPDATE, DELETE ON public.texnikum_hudud_stat TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.texnikum_anketa TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Seed: 2026 anketa yig'masidan hisoblangan agregatlar.
-- davlat/nodavlat — viloyat varaqlaridagi ASOSIY jadval qatorlari (74 Davlat + 51 Xususiy = 125);
-- varaq pastidagi «Kvota jadvali» yo'nalish qatorlari muassasa emas, sanalmaydi.
-- vakant — shtat birligi kasrli (3,5 kabi), hudud bo'yicha yaxlitlangan.
INSERT INTO public.texnikum_hudud_stat
    (hudud, davlat, nodavlat, oquvchilar, ayollar, davlat_granti, kontrakt, bitiruvchi, qabul_kvota, pedagoglar, vakant, kompyuterlar, laboratoriyalar, simulyatsion, amaliy_baza, anketa_tuliq)
VALUES
    ('Namangan',          7,  3, 8076, 7543, 1792, 6001, 1032, 6279, 513,  4, 435, 16, 41, 123, 9),
    ('Farg''ona',         9,  4, 6445, 5884, 1283, 5172,  985, 4740, 372,  5, 375, 17, 23, 244, 6),
    ('Qashqadaryo',       4,  8, 4063, 3755,  652, 3401,  693, 2299, 202,  4, 381, 12, 36,  21, 4),
    ('Jizzax',            4,  1, 3628, 3502,  387, 3241,  981, 1882, 299,  0, 196, 16, 15,  51, 3),
    ('Andijon',           7,  2, 2997, 2761,  311, 2686, 1489, 2430, 231, 12, 240,  5, 15,  16, 2),
    ('Navoiy',            3,  1, 2365, 2304,  435, 1930,  546, 1709, 181,  1, 144,  8, 27,  38, 3),
    ('Sirdaryo',          3,  2, 1949, 1865,  501, 1448,  378, 1260, 140,  7, 214, 41, 16,  42, 3),
    ('Surxondaryo',       5,  4, 1862, 1762,  383, 1479,  206, 1626,  69,  5, 165, 50,  6,  28, 2),
    ('Toshkent sh.',      5, 10, 1446, 1349,  248, 1198,   38, 1050,  79,  8,  80, 20,  0,  15, 1),
    ('Toshkent vil.',     6,  3, 1282, 1226,  272, 1010,  488,  420,  62, 12, 131, 54,  8,   6, 2),
    ('Samarqand',         9,  3, 1139, 1000,  214,  925,  400,  570,  67,  1, 104,  8, 17,   0, 1),
    ('Qoraqalpog''iston', 6,  2,  984,  952,  256,  682,  145,  983,  88, 13, 156,  4, 11,  10, 2),
    ('Buxoro',            4,  6,  700,  658,  132,  568,  232,  510,  37,  0,  68,  0,  1,   1, 1),
    ('Xorazm',            2,  2,    0,    0,    0,    0,    0,    0,   0,  0,   0,  0,  0,   0, 0)
ON CONFLICT (hudud) DO NOTHING;

INSERT INTO public.texnikum_anketa (muassasa, hudud, topshirilgan_sana, bolimlar, fayl)
SELECT v.muassasa, v.hudud, v.sana::date, 10, v.fayl
FROM (VALUES
    ('Olmaliq Abu Ali ibn Sino nomidagi JST',          'Toshkent viloyati',              '2026-07-10', 'Olmaliq JST_.xlsx'),
    ('Farg''ona tumani Abu Ali ibn Sino nomidagi JST', 'Farg''ona viloyati',             '2026-06-19', 'Farg''ona tumani tibbiyot Texnikum_2026-06-19 (2).xlsx'),
    ('Ellikqal''a Abu Ali ibn Sino nomidagi JST',      'Qoraqalpog''iston Respublikasi', '2026-06-18', 'ЭЛЛИККАЛЪА_ЖСТ_Техникум_маълумотлари.xlsx')
) AS v(muassasa, hudud, sana, fayl)
WHERE NOT EXISTS (SELECT 1 FROM public.texnikum_anketa a WHERE a.muassasa = v.muassasa);
