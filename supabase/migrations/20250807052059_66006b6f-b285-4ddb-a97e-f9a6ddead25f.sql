-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT auth.email() = 'carakawidi07@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;