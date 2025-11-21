-- Security Fix: Create public view for organizers without exposing contact information
-- This implements Option B: Balanced approach between transparency and privacy

-- Create a public view that excludes sensitive contact information
CREATE OR REPLACE VIEW public.public_organizers AS
  SELECT 
    id,
    organization_name,
    organization_type,
    description,
    website_url,
    status,
    created_at
  FROM public.organizers
  WHERE status = 'approved';

-- Grant access to the view for anonymous users
GRANT SELECT ON public.public_organizers TO anon;
GRANT SELECT ON public.public_organizers TO authenticated;

-- Update the existing organizers table policy to restrict full access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view approved organizers" ON organizers;

-- Authenticated users can see full organizer details (including contact info)
CREATE POLICY "Authenticated users can view approved organizers"
  ON organizers FOR SELECT
  TO authenticated
  USING (status = 'approved' OR user_id = auth.uid());

-- Organizers can always view their own records regardless of status
CREATE POLICY "Organizers can view own record"
  ON organizers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());