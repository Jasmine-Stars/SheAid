-- 添加钱包地址字段到profiles表
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- 添加注释
COMMENT ON COLUMN public.profiles.wallet_address IS 'User''s Ethereum wallet address for Web3 authentication';