-- =========================================================
-- ETTP — Oliy ta'lim talabalari (TDTU kontingenti, 03.09.2026)
-- Manba: docs/bakalavriat/TDTU_03_09_2026_holatiga_tahsil_olayotgan_Talabalar_ro'yxati.xlsx
-- 27 739 talaba: Bakalavr 24 382, Ordinatura 2 104, Magistr 1 253.
-- Har talabaga auth hisob (login/parol) seed_talaba.sql'da beriladi.
-- =========================================================

-- 1. Yangi rol: 'talaba' — faqat o'z profilini/ma'lumotini ko'radi,
--    vazirlik/admin reyestrlari va statistikasidan chiqarib tashlanadi.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rol_check;
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_rol_check CHECK (rol IN ('vazirlik', 'admin', 'xodim', 'talaba'));

-- 2. Talaba jadvali (manba ustunlari birga-bir)
CREATE TABLE IF NOT EXISTS public.talaba (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tartib INTEGER,                                   -- manba ro'yxatidagi №
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    fish TEXT NOT NULL,
    tugilgan_sana DATE,
    jinsi TEXT CHECK (jinsi IN ('erkak', 'ayol')),
    muassasa TEXT NOT NULL DEFAULT 'Toshkent davlat tibbiyot universiteti',
    fakultet TEXT NOT NULL,
    mutaxassislik TEXT NOT NULL,
    kurs INTEGER NOT NULL,
    guruh TEXT,
    talim_turi TEXT NOT NULL CHECK (talim_turi IN ('Bakalavr', 'Magistr', 'Ordinatura')),
    login TEXT NOT NULL UNIQUE,                       -- <familiya>.<ism>@talaba.tdtu.uz
    manba_sanasi DATE NOT NULL DEFAULT '2026-09-03',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS talaba_fakultet_idx ON public.talaba (talim_turi, fakultet);
CREATE INDEX IF NOT EXISTS talaba_fish_idx ON public.talaba (fish);

-- 3. RLS: vazirlik/admin hammasini, talaba faqat o'zini ko'radi; yozish faqat admin
ALTER TABLE public.talaba ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talaba select policy"
    ON public.talaba FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "Admin manage talaba"
    ON public.talaba FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talaba TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Agregat view'lar (dashboard uchun; PostgREST max_rows=1000 dan ancha kichik).
--    security_invoker: RLS chaqiruvchi rolida qo'llanadi — talaba faqat o'z qatorini ko'radi.
CREATE OR REPLACE VIEW public.talaba_fakultet_stat
    WITH (security_invoker = true) AS
    SELECT talim_turi, fakultet, kurs, jinsi, COUNT(*)::INTEGER AS soni
    FROM public.talaba
    GROUP BY talim_turi, fakultet, kurs, jinsi;

CREATE OR REPLACE VIEW public.talaba_mutaxassislik_stat
    WITH (security_invoker = true) AS
    SELECT talim_turi, fakultet, mutaxassislik, COUNT(*)::INTEGER AS soni
    FROM public.talaba
    GROUP BY talim_turi, fakultet, mutaxassislik;

GRANT SELECT ON public.talaba_fakultet_stat TO authenticated;
GRANT SELECT ON public.talaba_mutaxassislik_stat TO authenticated;
