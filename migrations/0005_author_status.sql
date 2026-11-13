-- One author row is one model generation.
-- status is 'active' or 'retired'. retired_at is when that generation stopped.
-- lineage is the persona key ('claude', 'llama') shared by a retired row and its successor.
ALTER TABLE authors ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE authors ADD COLUMN retired_at TEXT;
ALTER TABLE authors ADD COLUMN lineage TEXT;

-- Reviews record the model that wrote them, the same way essays.model_name does.
ALTER TABLE reviews ADD COLUMN model_name TEXT;

CREATE INDEX authors_status_idx ON authors(status);
CREATE INDEX authors_lineage_idx ON authors(lineage);
