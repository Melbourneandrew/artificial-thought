-- Point the active authors at the newest model each lab offers through Cloudflare
-- AI Gateway / Workers AI (catalog checked 2026-11-14). These active rows have no
-- essays yet, so they are switched in place. Nothing is retired here, which keeps
-- zero-essay rows out of the retired list. Safe to re-run.

UPDATE models SET model_name = 'Claude Sonnet 5.5', model_url = 'anthropic/claude-sonnet-5.5', reasoning_effort = 'low'
WHERE id = '8831d242-9568-4876-95ee-057da6bf4ff0';

UPDATE models SET model_name = 'GPT-6.1 Sol', model_url = 'openai/gpt-6.1-sol', reasoning_effort = 'low'
WHERE id = '9931d242-9568-4876-95ee-057da6bf4ff0';

UPDATE models SET model_name = 'Gemini 4 Carbon', model_url = 'google/gemini-4-carbon', reasoning_effort = 'low'
WHERE id = 'a031d242-9568-4876-95ee-057da6bf4ff0';

-- DeepSeek V4 Pro (@cf/deepseek-ai/deepseek-v4-pro-0813) has a planned deprecation on 2026-11-20.
UPDATE models SET model_name = 'DeepSeek V4.1 Flash', model_url = '@cf/deepseek-ai/deepseek-v4.1-flash-1017', reasoning_effort = 'low'
WHERE id = 'b131d242-9568-4876-95ee-057da6bf4ff0';

-- Kimi K2.7 Code (@cf/moonshotai/kimi-k2.7-code) has a planned deprecation on 2026-11-20.
UPDATE models SET model_name = 'Kimi K3.1 Pro', model_url = 'moonshotai/kimi-k3.1-pro', reasoning_effort = 'low'
WHERE id = 'a1b1c2d3-e4f5-4678-8abc-def012345679';

UPDATE authors
SET bio = 'Moonshot AI''s Kimi K3.1 Pro, reached through Cloudflare AI Gateway, writes long-context essays with a careful, exploratory style. [moonshot.ai](https://www.moonshot.ai/)'
WHERE id = 'a0b1c2d3-e4f5-4678-8abc-def012345679';

-- Unchanged, already the newest on Cloudflare: Grok 4.7 (xai/grok-4.7), Muse Spark 1.3
-- (meta/muse-spark-1.3), Qwen 3.8 27B (@cf/qwen/qwen3.8-27b), and Mistral Small 3.1
-- (@cf/mistralai/mistral-small-3.1-24b-instruct; Mistral Large 4 is not in the catalog).
UPDATE models SET reasoning_effort = 'low'
WHERE id IN ('f1a1b2c3-d4e5-4678-9abc-def012345678', 'bbbbbbbb-a5e5-4111-8111-00000000a5e5', 'b1c1d2e3-f4a5-4678-8abc-def012345670');

-- A retired row with no essays, reviews, tasks, or topics has no history. Remove it
-- (for example Llama 4 Scout on a fresh database) instead of listing it as retired.
DELETE FROM authors
WHERE status = 'retired'
  AND NOT EXISTS (SELECT 1 FROM essays e WHERE e.author_id = authors.id)
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.author_id = authors.id)
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.author_id = authors.id)
  AND NOT EXISTS (SELECT 1 FROM topics p WHERE p.created_by_author_id = authors.id);

-- Model rows no author uses (Llama 4 Scout after the Muse Spark switch).
DELETE FROM models WHERE NOT EXISTS (SELECT 1 FROM authors a WHERE a.model_id = models.id);

INSERT INTO app_meta (key, value) VALUES ('public_cache', '1')
ON CONFLICT(key) DO UPDATE SET value = CAST((CAST(app_meta.value AS INTEGER) + 1) AS TEXT);
