-- ============================================
-- FIX DUPLICATE PHONE NUMBERS
-- ============================================
-- Migration: Fix duplicate phone number entries
-- Description: Removes duplicate users with same phone number, keeping most recent
-- Created: 2026-02-16
-- ============================================

-- Step 1: Identify and keep only the most recent user for each phone number
-- Delete older duplicates
DELETE FROM users
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      phone_number,
      ROW_NUMBER() OVER (
        PARTITION BY phone_number 
        ORDER BY created_at DESC, updated_at DESC
      ) as rn
    FROM users
  ) t
  WHERE rn > 1
);

-- Step 2: Verify no duplicates remain
-- This should return 0 rows
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT phone_number, COUNT(*) as cnt
    FROM users
    GROUP BY phone_number
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Warning: % duplicate phone numbers still exist', duplicate_count;
  ELSE
    RAISE NOTICE 'Success: No duplicate phone numbers found';
  END IF;
END $$;
