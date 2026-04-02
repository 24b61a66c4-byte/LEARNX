CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    accent VARCHAR(255),
    backdrop TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS accent VARCHAR(255);

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS backdrop TEXT;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS subject_tags (
    subject_id VARCHAR(50) NOT NULL,
    tag VARCHAR(255),
    CONSTRAINT fk_subject_tags_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subject_tags_subject_id
    ON subject_tags(subject_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subject_tags_subject_tag
    ON subject_tags(subject_id, tag);

UPDATE learner_profiles
SET preferred_subject_id = 'dbms'
WHERE preferred_subject_id IN ('mathematics', 'math');

UPDATE quiz_results
SET subject_id = 'dbms'
WHERE subject_id IN ('mathematics', 'math');

UPDATE study_notes
SET subject_id = 'dbms'
WHERE subject_id IN ('mathematics', 'math');

UPDATE progress_snapshots
SET subject_id = 'dbms'
WHERE subject_id IN ('mathematics', 'math');

UPDATE quiz_scores
SET subject_id = 'dbms'
WHERE subject_id IN ('mathematics', 'math');

UPDATE learner_profiles
SET preferred_subject_id = 'edc'
WHERE preferred_subject_id = 'science';

UPDATE quiz_results
SET subject_id = 'edc'
WHERE subject_id = 'science';

UPDATE study_notes
SET subject_id = 'edc'
WHERE subject_id = 'science';

UPDATE progress_snapshots
SET subject_id = 'edc'
WHERE subject_id = 'science';

UPDATE quiz_scores
SET subject_id = 'edc'
WHERE subject_id = 'science';

DELETE FROM subject_tags
WHERE subject_id IN ('mathematics', 'science');

DELETE FROM subjects
WHERE id IN ('mathematics', 'science');

INSERT INTO subjects (
    id,
    name,
    description,
    accent,
    backdrop,
    display_order,
    is_active,
    created_at,
    updated_at
)
VALUES
    (
        'dbms',
        'Mathematics',
        'Numbers, patterns, and problem solving that build confidence for school and exams.',
        '#0f766e',
        'bg-teal-500/10 text-teal-900',
        1,
        TRUE,
        NOW(),
        NOW()
    ),
    (
        'edc',
        'Science',
        'Everyday concepts, experiments, and clear explanations you can use in class and beyond.',
        '#f59e0b',
        'bg-amber-400/15 text-amber-950',
        2,
        TRUE,
        NOW(),
        NOW()
    ),
    (
        'coding',
        'Coding',
        'Build programs, games, and logic step by step with friendly explanations and hands-on practice.',
        '#10b981',
        'bg-emerald-400/15 text-emerald-950',
        3,
        TRUE,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    accent = EXCLUDED.accent,
    backdrop = EXCLUDED.backdrop,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

DELETE FROM subject_tags
WHERE subject_id IN ('dbms', 'edc', 'coding');

INSERT INTO subject_tags (subject_id, tag)
VALUES
    ('dbms', 'math'),
    ('dbms', 'patterns'),
    ('dbms', 'revision'),
    ('edc', 'science'),
    ('edc', 'experiments'),
    ('edc', 'revision'),
    ('coding', 'coding'),
    ('coding', 'programming'),
    ('coding', 'logic');
