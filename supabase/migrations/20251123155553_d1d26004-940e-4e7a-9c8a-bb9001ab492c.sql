-- Add auditors table for auditor certification
CREATE TABLE IF NOT EXISTS public.auditors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  organization_name TEXT,
  certification_number TEXT,
  expertise_areas TEXT[] NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  description TEXT NOT NULL,
  verification_documents JSONB,
  status public.organizer_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auditors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auditors
CREATE POLICY "Users can create auditor applications"
  ON public.auditors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auditors can view own record"
  ON public.auditors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view approved auditors"
  ON public.auditors
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Users can update own pending applications"
  ON public.auditors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update all auditors"
  ON public.auditors
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_auditors_updated_at
  BEFORE UPDATE ON public.auditors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin role if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) THEN
    -- Note: Admin users need to be created manually with proper user_id
    NULL;
  END IF;
END $$;