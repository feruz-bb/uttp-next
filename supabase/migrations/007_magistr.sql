-- =========================================================
-- ETTP — Magistratura boyitish (docs/magistr_TDTU_2_3_kurs.xlsx)
-- 1 231 magistr (ro'yxatning qism-to'plami): mutaxassislik shifri (70910xxx),
-- kampus (2-kampus / Bosh bino), til (uz/ru), qabul yili, 2026/27 kursi.
-- Klassifikatorning magistratura shifrlari seed.sql'da real ro'yxat bilan
-- almashtirilgan (42 shifr) — talaba.mutaxassislik_kodi shunga mos.
-- =========================================================

ALTER TABLE public.talaba
    ADD COLUMN IF NOT EXISTS mutaxassislik_kodi VARCHAR(20),
    ADD COLUMN IF NOT EXISTS kampus TEXT,
    ADD COLUMN IF NOT EXISTS til TEXT CHECK (til IN ('uz', 'ru')),
    ADD COLUMN IF NOT EXISTS qabul_yili INTEGER;

CREATE INDEX IF NOT EXISTS talaba_kodi_idx ON public.talaba (mutaxassislik_kodi);

-- Mutaxassislik view'iga shifr ustuni qo'shiladi (oxiriga — CREATE OR REPLACE talabi)
CREATE OR REPLACE VIEW public.talaba_mutaxassislik_stat
    WITH (security_invoker = true) AS
    SELECT talim_turi, fakultet, mutaxassislik, COUNT(*)::INTEGER AS soni, mutaxassislik_kodi
    FROM public.talaba
    GROUP BY talim_turi, fakultet, mutaxassislik, mutaxassislik_kodi;

-- Magistr kesimi: kurs × jinsi × kampus × til × qabul yili
CREATE OR REPLACE VIEW public.talaba_magistr_stat
    WITH (security_invoker = true) AS
    SELECT kurs, jinsi, kampus, til, qabul_yili, COUNT(*)::INTEGER AS soni
    FROM public.talaba
    WHERE talim_turi = 'Magistr'
    GROUP BY kurs, jinsi, kampus, til, qabul_yili;

-- Yosh tarkibi: talim_turi × tug'ilgan yil × jinsi (barcha turlar uchun)
CREATE OR REPLACE VIEW public.talaba_yosh_stat
    WITH (security_invoker = true) AS
    SELECT talim_turi, EXTRACT(YEAR FROM tugilgan_sana)::INTEGER AS tugilgan_yil, jinsi, COUNT(*)::INTEGER AS soni
    FROM public.talaba
    WHERE tugilgan_sana IS NOT NULL
    GROUP BY talim_turi, EXTRACT(YEAR FROM tugilgan_sana), jinsi;

-- Magistr mutaxassisliklari: shifr × nom × kurs × jinsi (jins ulushi va ro'yxat jadvali uchun)
CREATE OR REPLACE VIEW public.talaba_magistr_mut_stat
    WITH (security_invoker = true) AS
    SELECT mutaxassislik_kodi, mutaxassislik, kurs, jinsi, COUNT(*)::INTEGER AS soni
    FROM public.talaba
    WHERE talim_turi = 'Magistr'
    GROUP BY mutaxassislik_kodi, mutaxassislik, kurs, jinsi;

GRANT SELECT ON public.talaba_magistr_mut_stat TO authenticated;
GRANT SELECT ON public.talaba_magistr_stat TO authenticated;
GRANT SELECT ON public.talaba_yosh_stat TO authenticated;
