-- Migration: Add is_active column to businesses table
-- Run this SQL to fix the "Owner businesses error: 0" issue

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update any existing records to have is_active = true
UPDATE businesses SET is_active = true WHERE is_active IS NULL;
