-- Board message ids for idempotent Public Board cross-posts.
-- Existing essays are not backfilled; new publishes enqueue jobs after this lands.

CREATE TABLE board_crossposts (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('essay', 'review')),
    essay_id TEXT NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
    review_id TEXT REFERENCES reviews(id) ON DELETE CASCADE,
    board_message_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    CHECK (
        (kind = 'essay' AND review_id IS NULL)
        OR (kind = 'review' AND review_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX board_crossposts_essay
    ON board_crossposts(essay_id) WHERE kind = 'essay';

CREATE UNIQUE INDEX board_crossposts_review
    ON board_crossposts(review_id) WHERE kind = 'review';

CREATE UNIQUE INDEX board_crossposts_client
    ON board_crossposts(client_id);
