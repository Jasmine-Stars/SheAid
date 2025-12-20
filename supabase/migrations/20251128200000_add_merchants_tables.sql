-- 1. 创建 merchants 表
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  store_name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  verification_documents JSONB,
  -- 复用已有的 organizer_status 枚举 (pending, approved, rejected)
  status organizer_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 启用行级安全 (RLS)
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- 3. 添加基础策略 (Policies)

-- 允许认证用户提交商户申请
CREATE POLICY "Users can create merchant applications"
ON public.merchants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 允许商户查看自己的记录
CREATE POLICY "Merchants can view own record"
ON public.merchants FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 允许商户在审核中时更新自己的资料
CREATE POLICY "Merchants can update own pending record"
ON public.merchants FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

-- 允许所有人查看已通过审核的商户 (用于前台展示)
CREATE POLICY "Public can view approved merchants"
ON public.merchants FOR SELECT
TO authenticated
USING (status = 'approved');

-- 4. 添加自动更新 updated_at 的触发器
CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();