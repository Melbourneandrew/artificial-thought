-- Per-model reasoning override. Null means the app default ("low").
-- skip: do not send a reasoning field (model has no reasoning control).
-- off: ask Workers AI to disable thinking.
-- none / low / other: sent as reasoning_effort.
ALTER TABLE models ADD COLUMN reasoning_effort TEXT;

UPDATE models SET reasoning_effort = 'low' WHERE reasoning_effort IS NULL;

-- GPT-4.1, Llama 4 Scout, and Mistral Small 3.1 do not advertise a reasoning control.
UPDATE models SET reasoning_effort = 'skip' WHERE model_url IN (
    'openai/gpt-4.1',
    '@cf/meta/llama-4-scout-17b-16e-instruct',
    '@cf/mistralai/mistral-small-3.1-24b-instruct'
);

-- DeepSeek V4 Pro's lowest documented level is none (below low).
UPDATE models SET reasoning_effort = 'none' WHERE model_url = '@cf/deepseek-ai/deepseek-v4-pro-0813';

-- Kimi K2.7 is documented as reasoning always on. Ask the template to disable thinking.
UPDATE models SET reasoning_effort = 'off' WHERE model_url = '@cf/moonshotai/kimi-k2.7-code';
