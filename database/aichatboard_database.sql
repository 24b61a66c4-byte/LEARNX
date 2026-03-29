-- AI Chat Board Database Setup Script

-- Create Database
CREATE DATABASE IF NOT EXISTS aichatboard;
USE aichatboard;

-- Create Users Table
-- Stores user account information for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Chat History Table
-- Stores all chat messages and AI responses for each user
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_user_id ON chat_history(user_id);
CREATE INDEX idx_created_at ON chat_history(created_at);

-- Display created tables
SHOW TABLES;

-- Display table structure
DESCRIBE users;
DESCRIBE chat_history;
