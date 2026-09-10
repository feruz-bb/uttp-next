-- =========================================================
-- ETTP — Doktorantura (PhD / DSc / stajyor-tadqiqotchi), TDTU 2024–2026
-- Manba: docs/doktarantlar_tayanch_doktarant.xlsx (383 kishi, 04.09.2026)
-- Har doktorantga auth hisob seed_doktorant.sql'da beriladi (rol='talaba',
-- hozirgi_bosqich='doktorantura'). PNFL ustuni yuklanmaydi.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.doktorant (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tartib INTEGER,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    fish TEXT NOT NULL,
    muassasa TEXT NOT NULL DEFAULT 'Toshkent davlat tibbiyot universiteti',
    ixtisoslik TEXT NOT NULL,
    ixtisoslik_shifri VARCHAR(20) NOT NULL,          -- OAK shifri: 14.00.xx, 03.00.xx ...
    bosqich TEXT NOT NULL CHECK (bosqich IN ('Tayanch doktorantura, PhD', 'Maqsadli tayanch doktorantura, PhD', 'Doktorantura, DSc', 'Stajyor-tadqiqotchi')),
    daraja TEXT NOT NULL CHECK (daraja IN ('PhD', 'DSc', 'Stajyor')),
    qabul_yili INTEGER NOT NULL,
    yosh INTEGER,
    jinsi TEXT CHECK (jinsi IN ('erkak', 'ayol')),   -- manbada 9 ta «No'malum» → NULL
    kurs INTEGER NOT NULL,
    tuman TEXT,                                      -- manbadagi xom yozuv (normallashtirilgan)
    hudud TEXT,                                      -- viloyat qisqa nomi (texnikum_hudud_stat bilan bir xil yozuv)
    hudud_id TEXT REFERENCES public.regions(id) ON DELETE SET NULL,
    mavzu TEXT,                                      -- ilmiy ish mavzusi
    rahbar TEXT,                                     -- ilmiy rahbar
    holat TEXT,
    login TEXT NOT NULL UNIQUE,                      -- <familiya>.<ism>@doktorant.tdtu.uz
    manba_sanasi DATE NOT NULL DEFAULT '2026-09-04',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS doktorant_shifr_idx ON public.doktorant (ixtisoslik_shifri);
CREATE INDEX IF NOT EXISTS doktorant_hudud_idx ON public.doktorant (hudud);

ALTER TABLE public.doktorant ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doktorant select policy"
    ON public.doktorant FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "Admin manage doktorant"
    ON public.doktorant FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doktorant TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Agregat view: bosqich × daraja × ixtisoslik × qabul yili × kurs × jinsi × hudud × yosh (aniq — o'rtacha yosh uchun)
CREATE OR REPLACE VIEW public.doktorant_stat
    WITH (security_invoker = true) AS
    SELECT bosqich, daraja, ixtisoslik_shifri, ixtisoslik, qabul_yili, kurs, jinsi, hudud, yosh, COUNT(*)::INTEGER AS soni
    FROM public.doktorant
    GROUP BY bosqich, daraja, ixtisoslik_shifri, ixtisoslik, qabul_yili, kurs, jinsi, hudud, yosh;

-- Ilmiy rahbarlar yuki: rahbar × daraja
CREATE OR REPLACE VIEW public.doktorant_rahbar_stat
    WITH (security_invoker = true) AS
    SELECT rahbar, daraja, COUNT(*)::INTEGER AS soni
    FROM public.doktorant
    WHERE rahbar IS NOT NULL
    GROUP BY rahbar, daraja;

GRANT SELECT ON public.doktorant_stat TO authenticated;
GRANT SELECT ON public.doktorant_rahbar_stat TO authenticated;
