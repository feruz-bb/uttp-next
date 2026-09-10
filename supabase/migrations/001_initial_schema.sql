-- =========================================================
-- UTTP Platform — Initial Database Schema
-- Canvas & Grill-me interview specifications
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Regions (Viloyatlar)
CREATE TABLE IF NOT EXISTS public.regions (
    id TEXT PRIMARY KEY,
    nomi TEXT NOT NULL,
    markaz TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Districts (Tumanlar)
CREATE TABLE IF NOT EXISTS public.districts (
    id SERIAL PRIMARY KEY,
    region_id TEXT NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    nomi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Specializations (Yo'nalishlar va mutaxassisliklar klassifikatori)
CREATE TABLE IF NOT EXISTS public.specializations (
    id SERIAL PRIMARY KEY,
    kodi VARCHAR(20) NOT NULL UNIQUE,
    nomi TEXT NOT NULL,
    bosqich TEXT NOT NULL, -- 'texnikum', 'bakalavriat', 'magistratura', 'ordinatura', 'doktorantura'
    turi TEXT, -- 'terapevtik', 'jarrohlik', 'fundamental', 'stomatologiya', va h.k.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles (Tibbiyot xodimi / Foydalanuvchi profili)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fish TEXT NOT NULL, -- F.I.O.
    jshshir VARCHAR(14) UNIQUE, -- Pasport/ID JSHSHIR
    tug_ilgan_sana DATE,
    jinsi TEXT CHECK (jinsi IN ('erkak', 'ayol')),
    telefon TEXT,
    email TEXT,
    manzil_viloyat_id TEXT REFERENCES public.regions(id) ON DELETE SET NULL,
    manzil_tuman TEXT,
    foto_url TEXT,
    
    -- Joriy ta'lim va ish holati
    hozirgi_bosqich TEXT CHECK (hozirgi_bosqich IN ('chuqurlashtirilgan_sinf', 'texnikum', 'bakalavr', 'magistr', 'rezidentura', 'doktor', 'doktorantura')),
    hozirgi_muassasa TEXT, -- Masalan: Toshkent davlat tibbiyot universiteti
    hozirgi_kurs INT DEFAULT 1,
    yonalish_kodi VARCHAR(20) REFERENCES public.specializations(kodi) ON DELETE SET NULL,
    ish_joyi TEXT, -- Masalan: Asaka tumani markaziy shifoxonasi
    lavozimi TEXT,
    
    -- Tizimdagi roli
    rol TEXT NOT NULL DEFAULT 'xodim' CHECK (rol IN ('vazirlik', 'admin', 'xodim')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Education History (Xodimning bosqichma-bosqich ta'lim tarixi)
CREATE TABLE IF NOT EXISTS public.education_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bosqich TEXT NOT NULL, -- 'chuqurlashtirilgan_sinf', 'texnikum', 'bakalavr', 'magistr', 'rezidentura', 'doktorantura'
    muassasa_nomi TEXT NOT NULL,
    yonalish_nomi TEXT,
    boshlangan_yil INT NOT NULL,
    tugatilgan_yil INT,
    diplom_raqami TEXT,
    diplom_sanasi DATE,
    holati TEXT DEFAULT 'tamomlagan' CHECK (holati IN ('tamomlagan', 'oqimoqda', 'chetlatilgan')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Licenses (TFX Malaka va Litsenziyalari - 5 yillik tsikl)
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tfx_raqami VARCHAR(50) NOT NULL,
    mutaxassislik TEXT NOT NULL,
    berilgan_sana DATE NOT NULL,
    amal_qilish_muddati DATE NOT NULL, -- Berilgan sana + 5 yil
    toifa TEXT, -- 'oliy', 'birinchi', 'ikkinchi', 'mutaxassis'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Litsenziya holati o'qish paytida hisoblanadi (CURRENT_DATE immutable emas,
-- shuning uchun STORED generated column bo'lolmaydi). PostgREST computed field:
-- GET /licenses?select=*,holati
CREATE OR REPLACE FUNCTION public.holati(lic public.licenses)
RETURNS TEXT AS $$
    SELECT CASE
        WHEN lic.amal_qilish_muddati < CURRENT_DATE THEN 'muddati_otgan'
        WHEN lic.amal_qilish_muddati <= (CURRENT_DATE + INTERVAL '6 months') THEN 'muddati_tugayapti'
        ELSE 'amal_qilmoqda'
    END;
$$ LANGUAGE sql STABLE;

-- 7. UKTT Credits (Uzluksiz kasbiy ta'lim kredit ballari va kurslar)
CREATE TABLE IF NOT EXISTS public.uktt_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kurs_nomi TEXT NOT NULL,
    tashkilot_nomi TEXT DEFAULT 'TIPME',
    kredit_ball INT NOT NULL DEFAULT 0,
    sertifikat_raqami VARCHAR(50),
    topshirilgan_sana DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for profiles updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
