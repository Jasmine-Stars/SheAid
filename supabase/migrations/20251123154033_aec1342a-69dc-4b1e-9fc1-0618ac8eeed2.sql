-- 创建资金分配表，用于追踪资金流向和物资分配
CREATE TABLE IF NOT EXISTS public.fund_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  donation_id uuid REFERENCES public.donations(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  allocation_type text NOT NULL CHECK (allocation_type IN ('cash', 'supplies', 'service')),
  description text NOT NULL,
  proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified')),
  allocated_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.fund_allocations ENABLE ROW LEVEL SECURITY;

-- 公众可以查看已完成的资金分配（透明度）
CREATE POLICY "Anyone can view completed allocations"
ON public.fund_allocations
FOR SELECT
USING (status = 'completed' OR status = 'verified');

-- NGO可以创建和管理项目的资金分配
CREATE POLICY "NGO can manage project allocations"
ON public.fund_allocations
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN organizers o ON p.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- 捐助人可以查看自己捐款相关的分配
CREATE POLICY "Donors can view own donation allocations"
ON public.fund_allocations
FOR SELECT
USING (
  donation_id IN (
    SELECT id FROM donations WHERE donor_id = auth.uid()
  )
);

-- 受助人可以查看与自己相关的分配
CREATE POLICY "Beneficiaries can view own allocations"
ON public.fund_allocations
FOR SELECT
USING (
  application_id IN (
    SELECT id FROM applications 
    WHERE contact_email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- 添加更新时间触发器
CREATE TRIGGER update_fund_allocations_updated_at
BEFORE UPDATE ON public.fund_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 为applications表添加project_id的外键约束（如果还没有）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_project_id_fkey'
  ) THEN
    ALTER TABLE public.applications
    ADD CONSTRAINT applications_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_fund_allocations_project_id ON public.fund_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_fund_allocations_application_id ON public.fund_allocations(application_id);
CREATE INDEX IF NOT EXISTS idx_fund_allocations_donation_id ON public.fund_allocations(donation_id);
CREATE INDEX IF NOT EXISTS idx_fund_allocations_status ON public.fund_allocations(status);