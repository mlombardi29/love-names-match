
-- 1. WIPE existing data
DELETE FROM public.swipes;
DELETE FROM public.custom_names;
DELETE FROM public.profiles;

-- 2. Drop old policies that depend on column shapes we're changing
DROP POLICY IF EXISTS "Both partners can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Both partners can view all swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Both partners can view all custom names" ON public.custom_names;
DROP POLICY IF EXISTS "Users can add custom names" ON public.custom_names;

-- 3. Update profiles: drop partner_role, add mode
ALTER TABLE public.profiles DROP COLUMN IF EXISTS partner_role;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'couple'));
-- Make user_id unique so each auth user has at most one profile
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 4. Create couples table
CREATE TABLE public.couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create couple_members table
CREATE TABLE public.couple_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_couple_members_couple_id ON public.couple_members(couple_id);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

-- 6. Add scoping columns to swipes and custom_names
ALTER TABLE public.swipes ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
ALTER TABLE public.swipes ADD COLUMN IF NOT EXISTS solo_owner_id UUID;
ALTER TABLE public.custom_names ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE;
ALTER TABLE public.custom_names ADD COLUMN IF NOT EXISTS solo_owner_id UUID;

-- Ensure each row is scoped to exactly one of: couple or solo owner
ALTER TABLE public.swipes ADD CONSTRAINT swipes_scope_chk CHECK (
  (couple_id IS NOT NULL AND solo_owner_id IS NULL) OR
  (couple_id IS NULL AND solo_owner_id IS NOT NULL)
);
ALTER TABLE public.custom_names ADD CONSTRAINT custom_names_scope_chk CHECK (
  (couple_id IS NOT NULL AND solo_owner_id IS NULL) OR
  (couple_id IS NULL AND solo_owner_id IS NOT NULL)
);

-- Unique swipe per (scope, user, name)
CREATE UNIQUE INDEX swipes_unique_couple ON public.swipes(couple_id, user_id, name_id) WHERE couple_id IS NOT NULL;
CREATE UNIQUE INDEX swipes_unique_solo ON public.swipes(solo_owner_id, name_id) WHERE solo_owner_id IS NOT NULL;

-- 7. Helper function: get current user's couple id (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_my_couple_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid() LIMIT 1
$$;

-- Helper: check if a user is in a given couple
CREATE OR REPLACE FUNCTION public.is_member_of_couple(_couple_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE couple_id = _couple_id AND user_id = auth.uid()
  )
$$;

-- Helper: count members in a couple (used to enforce max 2)
CREATE OR REPLACE FUNCTION public.couple_member_count(_couple_id UUID)
RETURNS INT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INT FROM public.couple_members WHERE couple_id = _couple_id
$$;

-- 8. RLS Policies

-- profiles: a user can see their own profile, or their partner's profile
CREATE POLICY "Users view own or partner profile"
ON public.profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR user_id IN (
    SELECT cm.user_id FROM public.couple_members cm
    WHERE cm.couple_id = public.get_my_couple_id()
  )
);

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- couples
CREATE POLICY "Members can view their couple"
ON public.couples FOR SELECT TO authenticated
USING (public.is_member_of_couple(id));

CREATE POLICY "Anyone authenticated can create a couple"
ON public.couples FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- couple_members
CREATE POLICY "Members view their couple membership"
ON public.couple_members FOR SELECT TO authenticated
USING (couple_id = public.get_my_couple_id() OR user_id = auth.uid());

-- Joining: only if (a) you aren't in any couple yet AND (b) the target couple has < 2 members
CREATE POLICY "Users can join a couple"
ON public.couple_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.get_my_couple_id() IS NULL
  AND public.couple_member_count(couple_id) < 2
);

-- swipes
CREATE POLICY "Users view swipes in their scope"
ON public.swipes FOR SELECT TO authenticated
USING (
  (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
  OR (solo_owner_id IS NOT NULL AND solo_owner_id = auth.uid())
);

CREATE POLICY "Users insert swipes in their scope"
ON public.swipes FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
    OR (solo_owner_id IS NOT NULL AND solo_owner_id = auth.uid() AND public.get_my_couple_id() IS NULL)
  )
);

CREATE POLICY "Users update own swipes in scope"
ON public.swipes FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  AND (
    (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
    OR (solo_owner_id IS NOT NULL AND solo_owner_id = auth.uid())
  )
);

-- custom_names
CREATE POLICY "Users view custom names in scope"
ON public.custom_names FOR SELECT TO authenticated
USING (
  (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
  OR (solo_owner_id IS NOT NULL AND solo_owner_id = auth.uid())
);

CREATE POLICY "Users add custom names in scope"
ON public.custom_names FOR INSERT TO authenticated
WITH CHECK (
  added_by = auth.uid()
  AND (
    (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id())
    OR (solo_owner_id IS NOT NULL AND solo_owner_id = auth.uid() AND public.get_my_couple_id() IS NULL)
  )
);

-- 9. Function: solo → couple upgrade (re-stamps user's solo data with new couple_id)
CREATE OR REPLACE FUNCTION public.upgrade_solo_data_to_couple(_couple_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is a member of the target couple
  IF NOT public.is_member_of_couple(_couple_id) THEN
    RAISE EXCEPTION 'Not a member of this couple';
  END IF;

  UPDATE public.swipes
    SET couple_id = _couple_id, solo_owner_id = NULL
    WHERE solo_owner_id = auth.uid();

  UPDATE public.custom_names
    SET couple_id = _couple_id, solo_owner_id = NULL
    WHERE solo_owner_id = auth.uid();

  UPDATE public.profiles
    SET mode = 'couple'
    WHERE user_id = auth.uid();
END;
$$;

-- 10. Function: generate unique 6-char invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no ambiguous chars
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;
