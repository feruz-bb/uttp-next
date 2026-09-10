-- =========================================================
-- ETTP — Ilm-fan va innovatsiyalar: story-e'lonlar
-- Canvas 3-yo'nalish («Ilm-fan»): grant loyihalari va e'lonlar Instagram-story
-- ko'rinishida barcha rollarga ko'rsatiladi. E'lon joylash — admin va vazirlik;
-- ko'rishlar statistikasi (kim, qachon) — admin va vazirlik; sozlamalar — admin.
-- =========================================================

-- 1. E'lonlar
CREATE TABLE IF NOT EXISTS public.elonlar (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sarlavha TEXT NOT NULL,
    matn TEXT,                                       -- story uchun qisqa matn
    muammo TEXT,                                     -- qaysi muammoga yechim (batafsil)
    mexanizm TEXT,                                   -- amalga oshirish mexanizmi (batafsil)
    soha TEXT,                                       -- tibbiyot / tibbiyot-ijtimoiy / farmatsevtika
    turi TEXT NOT NULL DEFAULT 'elon' CHECK (turi IN ('grant', 'innovatsiya', 'elon')),
    rang TEXT NOT NULL DEFAULT 'primary' CHECK (rang IN ('primary', 'teal', 'violet', 'navy', 'success', 'accent')),
    rasm_url TEXT,                                   -- ixtiyoriy muqova rasmi (URL)
    muassasa TEXT,
    mualliflar TEXT,
    qiymat NUMERIC(14, 0),                           -- loyiha qiymati, so'm
    bosqich TEXT,                                    -- yakunlangan / davom etmoqda / rejalashtirilgan
    muddat TEXT,                                     -- '2021–2024'
    manba TEXT,
    muallif_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    holat TEXT NOT NULL DEFAULT 'faol' CHECK (holat IN ('faol', 'arxiv')),
    tartib INTEGER NOT NULL DEFAULT 0,
    boshlanish TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tugash TIMESTAMPTZ,                              -- NULL = muddatsiz
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS elonlar_faol_idx ON public.elonlar (holat, boshlanish DESC);

CREATE OR REPLACE TRIGGER on_elon_updated
    BEFORE UPDATE ON public.elonlar
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. Ko'rishlar (har foydalanuvchi — har e'lon uchun bitta qator)
CREATE TABLE IF NOT EXISTS public.elon_korishlar (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    elon_id BIGINT NOT NULL REFERENCES public.elonlar(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    korilgan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (elon_id, user_id)
);

CREATE INDEX IF NOT EXISTS elon_korishlar_elon_idx ON public.elon_korishlar (elon_id);

-- 3. Sozlamalar (super admin boshqaradi)
CREATE TABLE IF NOT EXISTS public.sozlamalar (
    kalit TEXT PRIMARY KEY,
    qiymat JSONB NOT NULL,
    izoh TEXT,
    yangilangan TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.sozlamalar (kalit, qiymat, izoh) VALUES
    ('storylar_yoqilgan', 'true', 'Story-e''lonlar lentasi barcha kabinetlarda ko''rsatiladimi'),
    ('story_davomiyligi', '6', 'Bitta story avtomatik o''tish vaqti, soniya'),
    ('story_muddat_kun', '30', 'Yangi e''lon standart amal muddati, kun (0 = muddatsiz)'),
    ('story_kim_qosha_oladi', '["admin", "vazirlik"]', 'E''lon joylash huquqiga ega rollar')
ON CONFLICT (kalit) DO NOTHING;

-- 4. RLS
ALTER TABLE public.elonlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elon_korishlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sozlamalar ENABLE ROW LEVEL SECURITY;

-- Faol e'lonlarni hamma ko'radi; admin/vazirlik arxivni ham
CREATE POLICY "Elon select policy"
    ON public.elonlar FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR (holat = 'faol' AND boshlanish <= NOW() AND (tugash IS NULL OR tugash > NOW()))
    );

CREATE POLICY "Elon manage policy"
    ON public.elonlar FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) IN ('vazirlik', 'admin'))
    WITH CHECK ((SELECT public.get_current_user_role()) IN ('vazirlik', 'admin'));

-- Ko'rish belgisi: har kim faqat o'zi uchun yozadi; statistikani admin/vazirlik ko'radi
CREATE POLICY "Korish insert policy"
    ON public.elon_korishlar FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Korish select policy"
    ON public.elon_korishlar FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        OR (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
    );

CREATE POLICY "Korish delete policy"
    ON public.elon_korishlar FOR DELETE TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin');

CREATE POLICY "Sozlama select policy"
    ON public.sozlamalar FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sozlama manage policy"
    ON public.sozlamalar FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.elonlar TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.elon_korishlar TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sozlamalar TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. View'lar (security_invoker — RLS chaqiruvchi rolida)
-- Har e'lon bo'yicha ko'rishlar soni va oxirgi ko'rish vaqti
CREATE OR REPLACE VIEW public.elon_stat
    WITH (security_invoker = true) AS
    SELECT elon_id, COUNT(*)::INTEGER AS korishlar, MAX(korilgan) AS oxirgi
    FROM public.elon_korishlar
    GROUP BY elon_id;

-- Kim ko'rgan (admin/vazirlik uchun): profil bilan birga
CREATE OR REPLACE VIEW public.elon_korish_royxati
    WITH (security_invoker = true) AS
    SELECT k.elon_id, k.user_id, k.korilgan, p.fish, p.rol, p.hozirgi_bosqich, p.hozirgi_muassasa
    FROM public.elon_korishlar k
    JOIN public.profiles p ON p.id = k.user_id;

GRANT SELECT ON public.elon_stat TO authenticated;
GRANT SELECT ON public.elon_korish_royxati TO authenticated;
