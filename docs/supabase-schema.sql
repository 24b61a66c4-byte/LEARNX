-- LearnX Supabase PostgreSQL Schema
-- This file defines all tables for user data persistence

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Learner Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS learner_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  age INTEGER,
  cognitive_group VARCHAR(50), -- kids, tweens, teens, adults
  preferred_subject_id VARCHAR(50),
  study_goal VARCHAR(100), -- prepare-exams, understand-concepts, improve-problem-solving, revise-weak-topics
  exam_target VARCHAR(100), -- semester-exam, internal-assessment, lab-viva, interview-prep
  launch_mode VARCHAR(50), -- lesson, coach, streak
  interests TEXT[], -- Array of interest strings
  enable_visual_diagrams BOOLEAN DEFAULT true,
  enable_voice_input BOOLEAN DEFAULT true,
  enable_quiz_mode BOOLEAN DEFAULT true,
  accessibility_features TEXT[], -- Array: high-contrast, large-text, screen-reader, voice-mode
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Quiz Results / Practice History
CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) NOT NULL,
  topic_id VARCHAR(255),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_percent DECIMAL(5, 2) NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Notes
CREATE TABLE IF NOT EXISTS study_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) NOT NULL,
  topic_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(100), -- lesson, tutor, search, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Snapshots (learner analytics)
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id VARCHAR(50) NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  completed_topics INTEGER DEFAULT 0,
  strong_topics TEXT[], -- Array of topic IDs mastered
  weak_topics TEXT[], -- Array of topic IDs needing work
  practice_streak_days INTEGER DEFAULT 0,
  last_practice_date DATE,
  total_practice_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_learner_profiles_user_id ON learner_profiles(user_id);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_subject ON quiz_results(subject_id);
CREATE INDEX idx_quiz_results_created ON quiz_results(created_at);
CREATE INDEX idx_study_notes_user_id ON study_notes(user_id);
CREATE INDEX idx_study_notes_topic ON study_notes(topic_id);
CREATE INDEX idx_progress_snapshots_user_id ON progress_snapshots(user_id);
CREATE INDEX idx_progress_snapshots_subject ON progress_snapshots(subject_id);

-- Row Level Security (RLS) Policies
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view their own profile" ON learner_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON learner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON learner_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON study_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" ON study_notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON progress_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON progress_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON progress_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
