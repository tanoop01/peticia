-- ============================================
-- ADD LOCATION PINCODE FIELD
-- ============================================
-- Migration: Add pincode field to users table
-- Created: 2026-02-13
-- Description: Adds location_pincode column to store postal/ZIP codes for user locations
--
-- This extends the existing location tracking system to include pincode information
-- for better address management and petition geolocation.
-- ============================================

-- ============================================
-- ALTER USERS TABLE
-- ============================================
-- Add pincode column to users location fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location_pincode VARCHAR(10);

-- Add column comment for documentation
COMMENT ON COLUMN users.location_pincode IS 'Postal/ZIP code for user location (e.g., 144001 for Jalandhar, Punjab)';

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify the column was added successfully
-- Run this query to confirm:
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'location_pincode';
