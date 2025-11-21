-- Update app_role enum to support 5 roles while preserving data
-- We'll use a safer approach with ALTER TYPE ADD VALUE

-- Add new role values to existing enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'beneficiary';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'donor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ngo';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'merchant';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'auditor';

-- Note: Old values (admin, organizer, user) will remain for backward compatibility
-- Existing admins will keep their role
-- Future migrations can handle data conversion if needed