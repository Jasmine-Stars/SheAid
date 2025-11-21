-- Security Fix: Restrict user_roles table access to authenticated users only
-- This prevents unauthenticated users from enumerating admin and organizer roles

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view user roles" ON user_roles;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

-- The "Admins can manage roles" policy remains unchanged and continues to allow
-- admins to insert, update, and delete roles