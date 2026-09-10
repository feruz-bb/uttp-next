-- =========================================================
-- ETTP — Tibbiy jihozlar yig‘masi (vazirlik dashboardi «Tibbiy jihozlar» tabi)
-- Manba: docs/equipment_summary.xlsx — 3 875 muassasa × (jami, soz, nosoz, yaroqsiz).
-- Manbada viloyat ustuni yo'q: tuman → viloyat mapping'i scripts/gen_jihozlar.py da,
-- rus-kirill nomli tuman guruhlari lotin kanonik tumanga birlashtirilgan (manba_guruh — asl nom).
-- Nomsiz guruh (325 jihoz, 105 yozuv) hudud = «Ko‘rsatilmagan» bo'lib saqlanadi.
-- Seed: supabase/seed_jihozlar.sql (generatsiya qilingan).
-- =========================================================

-- 1. Muassasa kesimida jihozlar
CREATE TABLE IF NOT EXISTS public.jihoz_muassasa (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hudud TEXT NOT NULL,                        -- texnikum_hudud_stat.hudud bilan bir xil yoziladi («Toshkent sh.», «Farg‘ona»)
    tuman TEXT NOT NULL,                        -- kanonik tuman/shahar nomi
    manba_guruh TEXT,                           -- manbadagi asl guruh nomi (kirill bo'lishi mumkin)
    nomi TEXT NOT NULL,                         -- muassasa nomi (manbadagidek; takrorlanishi mumkin)
    turi TEXT NOT NULL,                         -- nom bo'yicha tasniflangan muassasa turi
    jami INTEGER NOT NULL DEFAULT 0,            -- jihozlar soni
    soz INTEGER NOT NULL DEFAULT 0,
    nosoz INTEGER NOT NULL DEFAULT 0,
    yaroqsiz INTEGER NOT NULL DEFAULT 0,
    yil INTEGER NOT NULL DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT jihoz_holat_yigindisi CHECK (soz + nosoz + yaroqsiz = jami)
);

CREATE INDEX IF NOT EXISTS jihoz_muassasa_hudud_idx ON public.jihoz_muassasa (hudud);
CREATE INDEX IF NOT EXISTS jihoz_muassasa_tuman_idx ON public.jihoz_muassasa (hudud, tuman);

-- RLS: o'qish barcha authenticated foydalanuvchilarga, yozish faqat admin'ga (004/005 uslubida)
ALTER TABLE public.jihoz_muassasa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read jihoz muassasa"
    ON public.jihoz_muassasa FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage jihoz muassasa"
    ON public.jihoz_muassasa FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jihoz_muassasa TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. Agregat view'lar (dashboard uchun; PostgREST max_rows=1000 dan kichik).
--    security_invoker: RLS chaqiruvchi rolida qo'llanadi.
CREATE OR REPLACE VIEW public.jihoz_hudud_stat
    WITH (security_invoker = true) AS
    SELECT hudud,
           COUNT(*)::INTEGER AS muassasa,
           COUNT(DISTINCT tuman)::INTEGER AS tuman_soni,
           SUM(jami)::INTEGER AS jami,
           SUM(soz)::INTEGER AS soz,
           SUM(nosoz)::INTEGER AS nosoz,
           SUM(yaroqsiz)::INTEGER AS yaroqsiz
    FROM public.jihoz_muassasa
    GROUP BY hudud;

CREATE OR REPLACE VIEW public.jihoz_tuman_stat
    WITH (security_invoker = true) AS
    SELECT hudud, tuman,
           COUNT(*)::INTEGER AS muassasa,
           SUM(jami)::INTEGER AS jami,
           SUM(soz)::INTEGER AS soz,
           SUM(nosoz)::INTEGER AS nosoz,
           SUM(yaroqsiz)::INTEGER AS yaroqsiz
    FROM public.jihoz_muassasa
    GROUP BY hudud, tuman;

CREATE OR REPLACE VIEW public.jihoz_turi_stat
    WITH (security_invoker = true) AS
    SELECT turi,
           COUNT(*)::INTEGER AS muassasa,
           SUM(jami)::INTEGER AS jami,
           SUM(soz)::INTEGER AS soz,
           SUM(nosoz)::INTEGER AS nosoz,
           SUM(yaroqsiz)::INTEGER AS yaroqsiz
    FROM public.jihoz_muassasa
    GROUP BY turi;

GRANT SELECT ON public.jihoz_hudud_stat TO authenticated;
GRANT SELECT ON public.jihoz_tuman_stat TO authenticated;
GRANT SELECT ON public.jihoz_turi_stat TO authenticated;
