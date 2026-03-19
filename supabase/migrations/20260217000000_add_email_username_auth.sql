-- ============================================
-- ADD EMAIL AND USERNAME AUTHENTICATION
-- ============================================
-- Migration: Add email and username support for authentication
-- Description: Transition from phone-only to email-based authentication
-- Created: 2026-02-17
-- ============================================

-- Step 1: Add new email and username columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 2: Make phone_number nullable (since we're moving to email auth)
ALTER TABLE users 
  ALTER COLUMN phone_number DROP NOT NULL;

-- Step 3: Make some profile fields nullable (filled after initial signup)
ALTER TABLE users 
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN state DROP NOT NULL;

-- Step 4: Add unique constraints for email and username
ALTER TABLE users 
  ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE users 
  ADD CONSTRAINT users_username_key UNIQUE (username);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Step 6: Add email_verified column
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Step 7: Add auth_provider column to track how user signed up
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email'; -- 'email', 'google', 'phone', etc.

-- Step 8: Add full_name column separate from display name
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added email and username authentication support';
END $$;
