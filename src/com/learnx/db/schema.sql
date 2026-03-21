-- LearnX initial schema
-- MySQL / MariaDB compatible

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id               INT          NOT NULL AUTO_INCREMENT,
    username         VARCHAR(64)  NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(128) NOT NULL,
    salt             VARCHAR(64)  NOT NULL,
    age              INT          NOT NULL DEFAULT 0,
    difficulty_level INT          NOT NULL DEFAULT 1,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- Index used by UserDao.findByUsername(): turns full-table scan into O(log n) seek.
    UNIQUE INDEX idx_users_username (username),
    -- Index used for email-based lookups (password reset, etc.).
    UNIQUE INDEX idx_users_email    (email)
);

-- ============================================================
-- Performance (session results)
-- ============================================================
CREATE TABLE IF NOT EXISTS performance (
    id              INT      NOT NULL AUTO_INCREMENT,
    user_id         INT      NOT NULL,
    topic_id        VARCHAR(50) NOT NULL,
    total_questions INT      NOT NULL DEFAULT 0,
    correct_answers INT      NOT NULL DEFAULT 0,
    session_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_performance_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- Composite index for PerformanceDao.findByUserAndTopic():
    -- covers the (user_id, topic_id) filter and the ORDER BY session_date in one B-tree pass.
    INDEX idx_performance_user_topic_date (user_id, topic_id, session_date DESC),

    -- Covering index for PerformanceDao.findLatestByUser():
    -- allows the "ORDER BY session_date DESC LIMIT 10" query to be resolved from the index alone.
    INDEX idx_performance_user_date  (user_id, session_date DESC)
);
