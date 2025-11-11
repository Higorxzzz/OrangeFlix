/*
  # Add RLS policies for user_roles table

  1. Security Changes
    - Add policy to allow service role (edge functions) to read user_roles
    - Add policy to allow users to view their own roles
    - Maintain security by restricting direct user access

  This fixes the "Forbidden: Admin access required" error by allowing
  edge functions with service role to verify admin access.
*/

-- Allow service role (used by edge functions) to read all user roles
CREATE POLICY "Service role can read user_roles"
  ON public.user_roles
  FOR SELECT
  TO service_role
  USING (true);

-- Allow authenticated users to view their own roles only
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
