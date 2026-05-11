-- Migration: Update announcements table with delivery tracking columns
-- Run this in Supabase SQL Editor

ALTER TABLE announcements ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT ARRAY['sms', 'whatsapp'];
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS individual_guardian_id UUID REFERENCES guardians(id);
