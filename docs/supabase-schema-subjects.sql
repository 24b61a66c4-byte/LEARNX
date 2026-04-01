-- Migration: Create subjects table for generic subject support
-- Date: 2026-04-01
-- Purpose: Move from hardcoded DBMS/EDC to configurable subject system

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  accent TEXT DEFAULT '#3B82F6',
  backdrop TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "subjects_select_public" ON subjects
  FOR SELECT USING (is_active = TRUE);

-- Seed initial subjects
INSERT INTO subjects (id, name, description, tags, display_order) VALUES
  (
    'mathematics',
    'Mathematics',
    'Numbers, patterns, and problem solving that build confidence for school and exams.',
    ARRAY['math', 'patterns', 'revision'],
    1
  ),
  (
    'science',
    'Science',
    'Everyday concepts, experiments, and clear explanations you can use in class and beyond.',
    ARRAY['science', 'experiments', 'revision'],
    2
  )
ON CONFLICT (id) DO NOTHING;

-- Migration helper: Map old IDs to new IDs for backward compatibility
CREATE OR REPLACE FUNCTION map_old_subject_id(old_id TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN old_id = 'dbms' THEN 'mathematics'
    WHEN old_id = 'edc' THEN 'science'
    ELSE old_id
  END;
END;
$$ LANGUAGE plpgsql;

-- Update any existing profiles that use old IDs (if needed)
-- This is optional - old IDs will continue to work via map_old_subject_id()
