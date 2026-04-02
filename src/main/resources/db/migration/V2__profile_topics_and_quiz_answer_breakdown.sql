ALTER TABLE learner_profiles
    ADD COLUMN IF NOT EXISTS preferred_topic_ids TEXT ARRAY;

CREATE TABLE IF NOT EXISTS quiz_result_answers (
    quiz_result_id BIGINT NOT NULL,
    question_id VARCHAR(100),
    topic_id VARCHAR(255),
    prompt VARCHAR(2000),
    correct BOOLEAN,
    score INTEGER,
    explanation VARCHAR(4000),
    learner_answer VARCHAR(4000),
    correct_answer VARCHAR(4000),
    CONSTRAINT fk_quiz_result_answers_result
        FOREIGN KEY (quiz_result_id)
        REFERENCES quiz_results(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_result_answers_result_id
    ON quiz_result_answers(quiz_result_id);
