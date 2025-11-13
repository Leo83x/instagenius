-- Add new columns for OAuth and token management
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS facebook_page_id TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS token_last_refreshed_at TIMESTAMP WITH TIME ZONE;