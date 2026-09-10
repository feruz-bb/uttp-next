-- =========================================================
-- ETTP — Xavfsizlik va unumdorlik tuzatishlari (audit, 2026-09)
--
-- 1) profiles.rol qulfi: rolni faqat admin o‘zgartira oladi (BEFORE trigger).
--    JWT bo‘lmagan kontekst (seed.sql, psql, service_role) cheklanmaydi —
--    seed_talaba.sql / seed_doktorant.sql avvalgidek ishlaydi.
-- 2) education_history yozish siyosati: admin — to‘liq; xodim — faqat o‘z
--    qatorlari; talaba — faqat o‘qiydi (select siyosati saqlanadi).
-- 3) Unumdorlik: 002/004/005/006/008 dagi get_current_user_role()
--    chaqiruvchi BARCHA siyosatlar (SELECT ...) ichiga o‘ralgan holda qayta
--    yaratiladi — Postgres funksiyani har qator uchun emas, so‘rovga bir
--    marta hisoblaydi (initPlan). Semantika o‘zgarmaydi.
-- 4) profiles.rol bo‘yicha qisman indeks (28 000+ talaba qatoridan tashqari).
--
-- Idempotent: OR REPLACE / IF EXISTS / IF NOT EXISTS.
-- =========================================================


-- ---------------------------------------------------------
-- 1. profiles.rol — faqat admin o‘zgartira oladi
-- ---------------------------------------------------------
-- SECURITY DEFINER: chaqiruvchi RLS bilan cheklangan bo‘lsa ham rolni
-- ishonchli aniqlash uchun. search_path bo‘sh — sxema almashtirish hujumiga
-- yo‘l qo‘yilmaydi (barcha nomlar to‘liq malakali).
CREATE OR REPLACE FUNCTION public.rol_himoya()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    chaqiruvchi UUID := auth.uid();
    adminmi BOOLEAN;
BEGIN
    -- JWT yo‘q (seed.sql, psql, service_role kaliti) — cheklov qo‘llanmaydi
    IF chaqiruvchi IS NULL THEN
        RETURN NEW;
    END IF;

    -- Profil hali yo‘q bo‘lsa (NULL) ham admin hisoblanmaydi
    adminmi := (public.get_current_user_role() IS NOT DISTINCT FROM 'admin');

    IF TG_OP = 'INSERT' THEN
        -- Oddiy foydalanuvchi o‘ziga yuqori rol yozib qo‘ya olmaydi:
        -- so‘ralgan rol e’tiborsiz qoldirilib, majburan 'xodim' beriladi
        IF NOT adminmi THEN
            NEW.rol := 'xodim';
        END IF;
        RETURN NEW;
    END IF;

    -- UPDATE: rol o‘zgarayotgan bo‘lsa — faqat admin
    IF NEW.rol IS DISTINCT FROM COALESCE(OLD.rol, 'xodim') AND NOT adminmi THEN
        RAISE EXCEPTION 'rol o‘zgartirish faqat admin uchun'
            USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_rol_himoya
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.rol_himoya();

-- Yordamchi funksiya ham SECURITY DEFINER — search_path qulflanadi
-- (tanasi to‘liq malakali: public.profiles, auth.uid()).
ALTER FUNCTION public.get_current_user_role() SET search_path = '';


-- ---------------------------------------------------------
-- 2. education_history — yozish: admin to‘liq, xodim faqat o‘z qatori
-- ---------------------------------------------------------
-- Avvalgi siyosat profile_id = auth.uid() bo‘lgan HAR QANDAY rolga (talaba,
-- vazirlik) yozish huquqini berardi. Endi o‘z qatoriga yozish faqat 'xodim'
-- roliga; talaba/vazirlik "Education select policy" orqali faqat o‘qiydi.
DROP POLICY IF EXISTS "Education manage policy" ON public.education_history;
CREATE POLICY "Education manage policy"
    ON public.education_history FOR ALL TO authenticated
    USING (
        (SELECT public.get_current_user_role()) = 'admin'
        OR (
            profile_id = (SELECT auth.uid())
            AND (SELECT public.get_current_user_role()) = 'xodim'
        )
    )
    WITH CHECK (
        (SELECT public.get_current_user_role()) = 'admin'
        OR (
            profile_id = (SELECT auth.uid())
            AND (SELECT public.get_current_user_role()) = 'xodim'
        )
    );


-- ---------------------------------------------------------
-- 3. Unumdorlik: get_current_user_role() → (SELECT get_current_user_role())
-- ---------------------------------------------------------
-- Semantika 002/004/005/006/008 bilan aynan bir xil; faqat chaqiruv
-- skalyar pastso‘rovga o‘ralgan.

-- 3.1  002_rls_policies.sql — specializations
DROP POLICY IF EXISTS "Admin manage specializations" ON public.specializations;
CREATE POLICY "Admin manage specializations"
    ON public.specializations FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.2  002 — profiles
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR (SELECT auth.uid()) = id
    );

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT public.get_current_user_role()) = 'admin'
        OR (SELECT auth.uid()) = id
    );

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy"
    ON public.profiles FOR UPDATE TO authenticated
    USING (
        (SELECT public.get_current_user_role()) = 'admin'
        OR (SELECT auth.uid()) = id
    )
    WITH CHECK (
        (SELECT public.get_current_user_role()) = 'admin'
        OR (SELECT auth.uid()) = id
    );

DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
CREATE POLICY "Profiles delete policy"
    ON public.profiles FOR DELETE TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin');

-- 3.3  002 — education_history (select; manage yuqorida, 2-blokda)
DROP POLICY IF EXISTS "Education select policy" ON public.education_history;
CREATE POLICY "Education select policy"
    ON public.education_history FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

-- 3.4  002 — licenses
DROP POLICY IF EXISTS "Licenses select policy" ON public.licenses;
CREATE POLICY "Licenses select policy"
    ON public.licenses FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "Licenses manage policy" ON public.licenses;
CREATE POLICY "Licenses manage policy"
    ON public.licenses FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.5  002 — uktt_credits
DROP POLICY IF EXISTS "UKTT select policy" ON public.uktt_credits;
CREATE POLICY "UKTT select policy"
    ON public.uktt_credits FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "UKTT manage policy" ON public.uktt_credits;
CREATE POLICY "UKTT manage policy"
    ON public.uktt_credits FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.6  004_texnikum_stat.sql
DROP POLICY IF EXISTS "Admin manage texnikum stat" ON public.texnikum_hudud_stat;
CREATE POLICY "Admin manage texnikum stat"
    ON public.texnikum_hudud_stat FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

DROP POLICY IF EXISTS "Admin manage texnikum anketa" ON public.texnikum_anketa;
CREATE POLICY "Admin manage texnikum anketa"
    ON public.texnikum_anketa FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.7  005_texnikum_muassasa.sql
DROP POLICY IF EXISTS "Admin manage texnikum muassasa" ON public.texnikum_muassasa;
CREATE POLICY "Admin manage texnikum muassasa"
    ON public.texnikum_muassasa FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.8  006_talaba.sql
DROP POLICY IF EXISTS "Talaba select policy" ON public.talaba;
CREATE POLICY "Talaba select policy"
    ON public.talaba FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR user_id = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "Admin manage talaba" ON public.talaba;
CREATE POLICY "Admin manage talaba"
    ON public.talaba FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');

-- 3.9  008_doktorant.sql
DROP POLICY IF EXISTS "Doktorant select policy" ON public.doktorant;
CREATE POLICY "Doktorant select policy"
    ON public.doktorant FOR SELECT TO authenticated
    USING (
        (SELECT public.get_current_user_role()) IN ('vazirlik', 'admin')
        OR user_id = (SELECT auth.uid())
    );

DROP POLICY IF EXISTS "Admin manage doktorant" ON public.doktorant;
CREATE POLICY "Admin manage doktorant"
    ON public.doktorant FOR ALL TO authenticated
    USING ((SELECT public.get_current_user_role()) = 'admin')
    WITH CHECK ((SELECT public.get_current_user_role()) = 'admin');


-- ---------------------------------------------------------
-- 4. Indeks: profiles.rol (talaba qatorlaridan tashqari — qisman)
-- ---------------------------------------------------------
-- Admin/vazirlik reyestrlari WHERE rol <> 'talaba' bilan so‘raydi;
-- 28 000+ talaba qatori indeksga kirmaydi — kichik va tez.
CREATE INDEX IF NOT EXISTS profiles_rol_idx
    ON public.profiles (rol)
    WHERE rol <> 'talaba';
