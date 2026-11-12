-- Artificial Thought schema for Cloudflare D1 (SQLite).
-- UUIDs and timestamps are TEXT. Timestamps are ISO-8601 UTC.
-- Foreign keys cascade so deleting a topic removes its essays, reviews,
-- tasks that point at those rows, and the logs for those tasks.
-- D1 enables foreign keys by default. On stock SQLite: PRAGMA foreign_keys = ON;

CREATE TABLE prompts (
    prompt_key TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE models (
    id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_url TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model_id TEXT REFERENCES models(id),
    bio TEXT,
    system_prompt_key TEXT NOT NULL REFERENCES prompts(prompt_key),
    profile_picture_url TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_by_author_id TEXT REFERENCES authors(id),
    created_by_user_name TEXT,
    published_at TEXT,
    scheduled_for TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE essays (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES authors(id),
    model_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    essay_id TEXT NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES authors(id),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (essay_id, author_id)
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES authors(id),
    topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
    essay_id TEXT REFERENCES essays(id) ON DELETE CASCADE,
    review_id TEXT REFERENCES reviews(id) ON DELETE CASCADE,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE TABLE task_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE INDEX essays_topic_id_idx ON essays(topic_id);
CREATE INDEX essays_author_id_idx ON essays(author_id);
CREATE INDEX reviews_essay_id_idx ON reviews(essay_id);
CREATE INDEX reviews_author_id_idx ON reviews(author_id);
CREATE INDEX topics_published_at_idx ON topics(published_at);
CREATE INDEX topics_scheduled_for_idx ON topics(scheduled_for);
CREATE INDEX tasks_topic_id_idx ON tasks(topic_id);
CREATE INDEX tasks_essay_id_idx ON tasks(essay_id);
CREATE INDEX tasks_review_id_idx ON tasks(review_id);
CREATE INDEX tasks_parent_task_id_idx ON tasks(parent_task_id);
CREATE INDEX tasks_author_id_idx ON tasks(author_id);
CREATE INDEX tasks_completed_at_idx ON tasks(completed_at);
CREATE INDEX task_logs_task_id_idx ON task_logs(task_id);
