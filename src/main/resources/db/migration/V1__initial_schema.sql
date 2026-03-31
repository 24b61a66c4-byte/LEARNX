CREATE TABLE IF NOT EXISTS learner_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    age INTEGER,
    cognitive_group VARCHAR(50),
    preferred_subject_id VARCHAR(50),
    study_goal VARCHAR(100),
    exam_target VARCHAR(100),
    launch_mode VARCHAR(50),
    interests TEXT ARRAY,
    enable_visual_diagrams BOOLEAN,
    enable_voice_input BOOLEAN,
    enable_quiz_mode BOOLEAN,
    accessibility_features TEXT ARRAY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON learner_profiles(user_id);

CREATE TABLE IF NOT EXISTS quiz_results (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    topic_id VARCHAR(255),
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    score_percent DOUBLE PRECISION NOT NULL,
    xp_earned INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject_id ON quiz_results(subject_id);

CREATE TABLE IF NOT EXISTS study_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_notes_user_id ON study_notes(user_id);

CREATE TABLE IF NOT EXISTS progress_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    total_xp INTEGER,
    current_level INTEGER,
    completed_topics INTEGER,
    strong_topics TEXT ARRAY,
    weak_topics TEXT ARRAY,
    practice_streak_days INTEGER,
    last_practice_date DATE,
    total_practice_minutes INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_snapshots_user_subject ON progress_snapshots(user_id, subject_id);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    age_category VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_scores (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    subject_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    taken_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS weak_topics (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    failure_count INTEGER NOT NULL,
    last_failed_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(16) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_timestamp ON chat_history(user_id, timestamp);
