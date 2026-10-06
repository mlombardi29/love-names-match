-- Let an authenticated user resolve an invite code before they are a member.
-- The couples SELECT policy only allows members, so a direct lookup returns
-- no row and the app treats every real invite as invalid.
-- This function returns only id and invite_code for the matching couple.
-- It does not list other couples and does not change any existing rows.

CREATE OR REPLACE FUNCTION public.lookup_couple_by_invite_code(_invite_code text)
RETURNS TABLE (id uuid, invite_code text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  normalized := upper(btrim(coalesce(_invite_code, '')));
  IF normalized = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id, c.invite_code
  FROM public.couples c
  WHERE c.invite_code = normalized
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_couple_by_invite_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_couple_by_invite_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.lookup_couple_by_invite_code(text) TO authenticated;

-- Make the new function visible to the API immediately.
NOTIFY pgrst, 'reload schema';
