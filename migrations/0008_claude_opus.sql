-- Move the active Claude author from Claude Sonnet 5.5 to Claude Opus 5.5, the newest
-- Opus in the Cloudflare AI Gateway catalog (checked 2026-11-14, $4 / $20 per 1M tokens).
-- The active Claude row has no essays, so its model row is updated in place and no
-- retired row is created. Safe to re-run.

UPDATE models SET model_name = 'Claude Opus 5.5', model_url = 'anthropic/claude-opus-5.5', reasoning_effort = 'low'
WHERE id = '8831d242-9568-4876-95ee-057da6bf4ff0';

INSERT INTO app_meta (key, value) VALUES ('public_cache', '1')
ON CONFLICT(key) DO UPDATE SET value = CAST((CAST(app_meta.value AS INTEGER) + 1) AS TEXT);
