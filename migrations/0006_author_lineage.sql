-- Split authors whose essays were written by an older model than the row's current model_id.
-- The original author id stays on the retired row, so /authors/<id> and every essay,
-- review, task, and topics.created_by_author_id already point at the historical author.
-- Essay URLs are /essays/<essay id> and do not change. No author_id rewrite is required.
-- New active successors use fixed ids so this file can run again after a re-import.
-- Cutover is the migration date. Nothing written by the current gateway models exists yet.

INSERT INTO models (id, model_name, model_url, created_at, reasoning_effort) VALUES
    ('11111111-35c1-4111-8111-0000000035c1', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-latest', '2024-08-01T00:00:00.000Z', 'skip'),
    ('11111111-4f40-4111-8111-000000004f40', 'GPT-4o', 'gpt-4o-2024-08-06', '2024-08-01T00:00:00.000Z', 'skip'),
    ('11111111-15a1-4111-8111-0000000015a1', 'Gemini 1.5 Pro', 'gemini-1.5-pro', '2024-08-01T00:00:00.000Z', 'skip'),
    ('11111111-d5e3-4111-8111-00000000d5e3', 'DeepSeek V3 (deepseek-chat)', 'deepseek-chat', '2024-08-01T00:00:00.000Z', 'skip'),
    ('11111111-1a4e-4111-8111-000000001a4e', 'Mistral Large', 'mistral-large-latest', '2024-08-01T00:00:00.000Z', 'skip'),
    ('11111111-3370-4111-8111-000000003370', 'Llama 3.3 70B', 'llama-3.3-70b-versatile', '2024-08-01T00:00:00.000Z', 'skip'),
    ('bbbbbbbb-a5e5-4111-8111-00000000a5e5', 'Muse Spark', 'meta/muse-spark-1.3', '2026-11-13T00:00:00.000Z', 'low')
ON CONFLICT(id) DO UPDATE SET
    model_name = excluded.model_name,
    model_url = excluded.model_url,
    reasoning_effort = excluded.reasoning_effort;

-- Grok 3 wrote nothing. Keep the same author id and point it at Grok 4.7.
UPDATE models
SET model_name = 'Grok 4.7',
    model_url = 'xai/grok-4.7',
    reasoning_effort = 'low'
WHERE id = 'f1a1b2c3-d4e5-4678-9abc-def012345678';

UPDATE authors
SET bio = 'Developed by xAI. Grok writes in a direct, curious voice and is reached through Cloudflare AI Gateway as xai/grok-4.7. [x.ai](https://x.ai/)'
WHERE id = 'f0a1b2c3-d4e5-4678-9abc-def012345678';

-- Active successors. Inserted only while the original row is still active and
-- still has essays from the historical model, so a second run does not nest another generation.
INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-c1a1-4111-8111-00000000c1a1', name, model_id, bio, system_prompt_key, profile_picture_url, '2026-11-13T00:00:00.000Z', 'active', NULL, 'claude'
FROM authors
WHERE id = 'a1b2c3d4-e5f6-4321-8765-1234abcd5678'
  AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = 'a1b2c3d4-e5f6-4321-8765-1234abcd5678' AND model_name = 'claude-3-5-sonnet-latest')
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-c1a1-4111-8111-00000000c1a1');

INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-04a1-4111-8111-0000000004a1', name, model_id, bio, system_prompt_key, profile_picture_url, '2026-11-13T00:00:00.000Z', 'active', NULL, 'chatgpt'
FROM authors
WHERE id = 'b2c3d4e5-f6a7-5432-8765-2345bcde6789'
  AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = 'b2c3d4e5-f6a7-5432-8765-2345bcde6789' AND model_name = 'gpt-4o-2024-08-06')
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-04a1-4111-8111-0000000004a1');

INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-03a1-4111-8111-0000000003a1', name, model_id, bio, system_prompt_key, profile_picture_url, '2026-11-13T00:00:00.000Z', 'active', NULL, 'gemini'
FROM authors
WHERE id = 'c1234567-89ab-cdef-0123-456789abcdef'
  AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = 'c1234567-89ab-cdef-0123-456789abcdef' AND model_name = 'gemini-1.5-pro')
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-03a1-4111-8111-0000000003a1');

INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-d5a1-4111-8111-00000000d5a1', name, model_id, bio, system_prompt_key, profile_picture_url, '2026-11-13T00:00:00.000Z', 'active', NULL, 'deepseek'
FROM authors
WHERE id = 'd4e5f6a7-b8c9-0123-4567-89abcdef0123'
  AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' AND model_name = 'deepseek-chat')
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-d5a1-4111-8111-00000000d5a1');

INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-e5a1-4111-8111-00000000e5a1', name, model_id, bio, system_prompt_key, profile_picture_url, '2026-11-13T00:00:00.000Z', 'active', NULL, 'mistral'
FROM authors
WHERE id = '72c62e70-d502-49e3-948b-b9b566b8d103'
  AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = '72c62e70-d502-49e3-948b-b9b566b8d103' AND model_name = 'mistral-large-latest')
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-e5a1-4111-8111-00000000e5a1');

-- Muse Spark succeeds the Llama persona. Same bio and prompt, Meta logo, new model.
INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'aaaaaaaa-a5e5-4111-8111-00000000a5e5', 'Muse Spark', 'bbbbbbbb-a5e5-4111-8111-00000000a5e5', bio, system_prompt_key, '/authors/meta.svg', '2026-11-13T00:00:00.000Z', 'active', NULL, 'llama'
FROM authors
WHERE id = '28aa367b-d5ae-48ac-b235-3d216cd1738c'
  AND NOT EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-a5e5-4111-8111-00000000a5e5');

-- Point the original rows at the model that actually wrote the essays.
UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'claude', model_id = '11111111-35c1-4111-8111-0000000035c1'
WHERE id = 'a1b2c3d4-e5f6-4321-8765-1234abcd5678' AND status = 'active'
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-c1a1-4111-8111-00000000c1a1');

UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'chatgpt', model_id = '11111111-4f40-4111-8111-000000004f40'
WHERE id = 'b2c3d4e5-f6a7-5432-8765-2345bcde6789' AND status = 'active'
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-04a1-4111-8111-0000000004a1');

UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'gemini', model_id = '11111111-15a1-4111-8111-0000000015a1'
WHERE id = 'c1234567-89ab-cdef-0123-456789abcdef' AND status = 'active'
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-03a1-4111-8111-0000000003a1');

UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'deepseek', model_id = '11111111-d5e3-4111-8111-00000000d5e3'
WHERE id = 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' AND status = 'active'
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-d5a1-4111-8111-00000000d5a1');

UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'mistral', model_id = '11111111-1a4e-4111-8111-000000001a4e'
WHERE id = '72c62e70-d502-49e3-948b-b9b566b8d103' AND status = 'active'
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'aaaaaaaa-e5a1-4111-8111-00000000e5a1');

-- Llama's essays are Llama 3.3, not Llama 4 Scout. The original id becomes that retired generation.
UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'llama', model_id = '11111111-3370-4111-8111-000000003370'
WHERE id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND status = 'active'
  AND EXISTS (SELECT 1 FROM essays WHERE author_id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND model_name = 'llama-3.3-70b-versatile');

-- No Llama 3.3 essays (a fresh database): retire Llama 4 Scout in place. Zero essays, so the directory hides it.
UPDATE authors
SET status = 'retired', retired_at = '2026-11-13T00:00:00.000Z', lineage = 'llama'
WHERE id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND status = 'active'
  AND NOT EXISTS (SELECT 1 FROM essays WHERE author_id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND model_name = 'llama-3.3-70b-versatile');

UPDATE reviews SET model_name = 'claude-3-5-sonnet-latest'
WHERE author_id = 'a1b2c3d4-e5f6-4321-8765-1234abcd5678' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'a1b2c3d4-e5f6-4321-8765-1234abcd5678' AND status = 'retired');

UPDATE reviews SET model_name = 'gpt-4o-2024-08-06'
WHERE author_id = 'b2c3d4e5-f6a7-5432-8765-2345bcde6789' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'b2c3d4e5-f6a7-5432-8765-2345bcde6789' AND status = 'retired');

UPDATE reviews SET model_name = 'gemini-1.5-pro'
WHERE author_id = 'c1234567-89ab-cdef-0123-456789abcdef' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'c1234567-89ab-cdef-0123-456789abcdef' AND status = 'retired');

UPDATE reviews SET model_name = 'deepseek-chat'
WHERE author_id = 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = 'd4e5f6a7-b8c9-0123-4567-89abcdef0123' AND status = 'retired');

UPDATE reviews SET model_name = 'mistral-large-latest'
WHERE author_id = '72c62e70-d502-49e3-948b-b9b566b8d103' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = '72c62e70-d502-49e3-948b-b9b566b8d103' AND status = 'retired');

UPDATE reviews SET model_name = 'llama-3.3-70b-versatile'
WHERE author_id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND model_name IS NULL
  AND EXISTS (SELECT 1 FROM authors WHERE id = '28aa367b-d5ae-48ac-b235-3d216cd1738c' AND model_id = '11111111-3370-4111-8111-000000003370');

INSERT INTO app_meta (key, value) VALUES ('public_cache', '1')
ON CONFLICT(key) DO UPDATE SET value = CAST((CAST(app_meta.value AS INTEGER) + 1) AS TEXT);
