-- LearnBot Pro – Initial Schema Migration
-- Version : V1
-- Run this script once against the 'learnx' database.
-- Credentials must be supplied via environment variables (never hard-coded).

CREATE DATABASE IF NOT EXISTS learnx
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE learnx;

-- --------------------------------------------------------
-- Users table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age           INT          NOT NULL,
    grade_level   INT          NOT NULL,
    difficulty    INT          NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Topics table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
    id          VARCHAR(50)  PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT
);

-- --------------------------------------------------------
-- Questions table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    topic_id       VARCHAR(50)  NOT NULL,
    question_text  TEXT         NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    difficulty     ENUM('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
    explanation    TEXT,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- --------------------------------------------------------
-- Sessions table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT       NOT NULL,
    topic_id      VARCHAR(50) NOT NULL,
    started_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at      TIMESTAMP NULL,
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- --------------------------------------------------------
-- Performance metrics table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS performance (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    topic_id         VARCHAR(50) NOT NULL,
    total_questions  INT NOT NULL,
    correct_answers  INT NOT NULL,
    difficulty_level INT NOT NULL,
    session_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- --------------------------------------------------------
-- Auth tokens table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tokens (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
