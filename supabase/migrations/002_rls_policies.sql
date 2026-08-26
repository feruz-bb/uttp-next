-- =========================================================
-- UTTP Platform — Row Level Security (RLS) Policies
-- 3 Roles: 'vazirlik' (Read-all), 'admin' (All-access), 'xodim' (Own-data)
-- =========================================================

-- Enable RLS on all exposed tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uktt_credits ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT rol FROM public.profiles WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Public Read Tables: regions, districts, specializations
CREATE POLICY "Allow authenticated to read regions"
    ON public.regions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to read districts"
    ON public.districts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to read specializations"
    ON public.specializations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage specializations"
    ON public.specializations FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- 2. Profiles Policies
-- SELECT: Admins & Vazirlik can view all profiles; Xodim can view own profile
CREATE POLICY "Profiles select policy"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR (SELECT auth.uid()) = id
    );

-- INSERT: Admins can insert; Xodim can insert own during signup
CREATE POLICY "Profiles insert policy"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (
        public.get_current_user_role() = 'admin'
        OR (SELECT auth.uid()) = id
    );

-- UPDATE: Admins can update all; Xodim can update own profile
CREATE POLICY "Profiles update policy"
    ON public.profiles FOR UPDATE TO authenticated
    USING (
        public.get_current_user_role() = 'admin'
        OR (SELECT auth.uid()) = id
    )
    WITH CHECK (
        public.get_current_user_role() = 'admin'
        OR (SELECT auth.uid()) = id
    );

-- DELETE: Only Admins can delete profiles
CREATE POLICY "Profiles delete policy"
    ON public.profiles FOR DELETE TO authenticated
    USING (public.get_current_user_role() = 'admin');

-- 3. Education History Policies
CREATE POLICY "Education select policy"
    ON public.education_history FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

CREATE POLICY "Education manage policy"
    ON public.education_history FOR ALL TO authenticated
    USING (
        public.get_current_user_role() = 'admin'
        OR profile_id = (SELECT auth.uid())
    )
    WITH CHECK (
        public.get_current_user_role() = 'admin'
        OR profile_id = (SELECT auth.uid())
    );

-- 4. Licenses Policies
CREATE POLICY "Licenses select policy"
    ON public.licenses FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

CREATE POLICY "Licenses manage policy"
    ON public.licenses FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- 5. UKTT Credits Policies
CREATE POLICY "UKTT select policy"
    ON public.uktt_credits FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() IN ('vazirlik', 'admin')
        OR profile_id = (SELECT auth.uid())
    );

CREATE POLICY "UKTT manage policy"
    ON public.uktt_credits FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');
