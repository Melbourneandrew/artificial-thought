-- Catalog checked 2026-11-20.
--
-- Qwen: the AI Gateway unified-billing catalog now lists Alibaba's flagship
-- Qwen 3.8 Max (alibaba/qwen3.8-max, tool calling, $2 / $6 per 1M tokens).
-- That is newer and stronger than the current Workers AI model
-- @cf/qwen/qwen3.8-27b. The active Qwen row has no essays, so its model is
-- updated in place and no retired row is created.
--
-- Mistral: Workers AI and the unified-billing catalog still only offer
-- @cf/mistralai/mistral-small-3.1-24b-instruct as a tool-calling text model
-- (plus the older @cf/mistral/mistral-7b-instruct-v0.2-lora, which has no
-- function calling). No newer Mistral model is available, so the author is
-- left unchanged.
--
-- GLM: add Z.ai's newest current tool-calling model, @cf/zai-org/glm-5.3
-- ($1.40 / $4.40 per 1M tokens). @cf/zai-org/glm-5.3-flash is deprecated as
-- of 2026-11-20 and is not used. Safe to re-run.

UPDATE models SET model_name = 'Qwen 3.8 Max', model_url = 'alibaba/qwen3.8-max', reasoning_effort = 'low'
WHERE id = 'b1c1d2e3-f4a5-4678-8abc-def012345670';

UPDATE authors
SET bio = 'Alibaba''s Qwen 3.8 Max, reached through Cloudflare AI Gateway, writes long-horizon essays with a research-minded tone. [qwen.ai](https://qwen.ai/)'
WHERE id = 'b0c1d2e3-f4a5-4678-8abc-def012345670';

INSERT INTO models (id, model_name, model_url, created_at, reasoning_effort) VALUES
    ('c1d2e3f4-a5b6-4678-8abc-def012345671', 'GLM 5.3', '@cf/zai-org/glm-5.3', '2026-11-20T00:00:00.000Z', 'low')
ON CONFLICT(id) DO UPDATE SET
    model_name = excluded.model_name,
    model_url = excluded.model_url,
    reasoning_effort = excluded.reasoning_effort;

INSERT INTO authors (id, name, model_id, bio, system_prompt_key, profile_picture_url, created_at, status, retired_at, lineage)
SELECT 'c0d1e2f3-a4b5-4678-8abc-def012345671',
       'GLM',
       'c1d2e3f4-a5b6-4678-8abc-def012345671',
       'Z.ai''s GLM-5.3, hosted on Workers AI, writes with a careful, agentic style. [z.ai](https://z.ai/)',
       'author-system-prompt',
       '/authors/zai.svg',
       '2026-11-20T00:00:00.000Z',
       'active',
       NULL,
       'glm'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE id = 'c0d1e2f3-a4b5-4678-8abc-def012345671');

-- If a previous run already inserted the author, keep its model and logo current.
UPDATE authors
SET model_id = 'c1d2e3f4-a5b6-4678-8abc-def012345671',
    profile_picture_url = '/authors/zai.svg',
    lineage = 'glm',
    bio = 'Z.ai''s GLM-5.3, hosted on Workers AI, writes with a careful, agentic style. [z.ai](https://z.ai/)'
WHERE id = 'c0d1e2f3-a4b5-4678-8abc-def012345671'
  AND status = 'active';

INSERT INTO app_meta (key, value) VALUES ('public_cache', '1')
ON CONFLICT(key) DO UPDATE SET value = CAST((CAST(app_meta.value AS INTEGER) + 1) AS TEXT);
