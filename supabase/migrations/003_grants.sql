-- =========================================================
-- UTTP Platform — Data API GRANTlari
-- Yangi CLI default: public sxema jadvallari API rollariga
-- avtomatik ochilmaydi — aniq GRANT talab qilinadi.
-- Qator darajasidagi cheklovlar RLS siyosatlarida (002).
-- =========================================================

GRANT USAGE ON SCHEMA public TO authenticated;

-- Ma'lumotnoma jadvallari — faqat o'qish (admin CRUD RLS orqali specializations'da)
GRANT SELECT ON public.regions TO authenticated;
GRANT SELECT ON public.districts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specializations TO authenticated;

-- Asosiy jadvallar — CRUD (qatorlar RLS bilan cheklanadi)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uktt_credits TO authenticated;

-- SERIAL ketma-ketliklar (districts.id, specializations.id)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Funksiyalar: rol aniqlash va litsenziya holati (computed field)
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.holati(public.licenses) TO authenticated;
