CREATE OR REPLACE FUNCTION public.create_couple_with_code()
RETURNS public.couples
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  new_couple public.couples;
  attempts INT := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Prevent creating a second couple if already in one
  IF public.get_my_couple_id() IS NOT NULL THEN
    RAISE EXCEPTION 'Already in a couple';
  END IF;

  LOOP
    attempts := attempts + 1;
    new_code := public.generate_invite_code();
    BEGIN
      INSERT INTO public.couples (invite_code, created_by)
      VALUES (new_code, auth.uid())
      RETURNING * INTO new_couple;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF attempts >= 10 THEN RAISE; END IF;
    END;
  END LOOP;

  INSERT INTO public.couple_members (couple_id, user_id)
  VALUES (new_couple.id, auth.uid());

  RETURN new_couple;
END;
$$;