-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  partner_role TEXT NOT NULL CHECK (partner_role IN ('partner1', 'partner2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both partners can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create custom_names table
CREATE TABLE public.custom_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('boy', 'girl', 'unisex')),
  origins JSONB NOT NULL DEFAULT '[]',
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both partners can view all custom names" ON public.custom_names
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add custom names" ON public.custom_names
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = added_by);

-- Create swipes table
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('like', 'superlike', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Both partners can view all swipes" ON public.swipes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own swipes" ON public.swipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipes" ON public.swipes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);