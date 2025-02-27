-- Insert sample models
INSERT INTO models (id, model_name, model_url) VALUES
    ('8831d242-9568-4876-95ee-057da6bf4ff0', 'claude-3-5-sonnet-latest', 'https://api.anthropic.com/v1/messages'),
    ('9931d242-9568-4876-95ee-057da6bf4ff0', 'gpt-4o', 'https://api.openai.com/v1'),
    ('a031d242-9568-4876-95ee-057da6bf4ff0', 'gemini-1.5-pro', 'https://generativelanguage.googleapis.com/v1beta/openai'),
    ('b131d242-9568-4876-95ee-057da6bf4ff0', 'deepseek-r1-distill-llama-70b', 'https://api.groq.com/openai/v1'),
    ('c231d242-9568-4876-95ee-057da6bf4ff0', 'mixtral-8x7b-32768', 'https://api.groq.com/openai/v1'),
    ('d331d242-9568-4876-95ee-057da6bf4ff0', 'llama-3.3-70b-versatile', 'https://api.groq.com/openai/v1'),
    ('e431d242-9568-4876-95ee-057da6bf4ff0', 'mistral-large-latest', 'https://api.mistral.ai/v1');


-- Insert sample prompts
INSERT INTO prompts (prompt_key, prompt) VALUES
    ('claude-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('gpt-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('gemini-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('deepseek-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('mistral-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('llama-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('essay-writing-prompt', 'Write an essay about {{topic}}. The essay should be informative and engaging.'),
    ('review-writing-prompt', 'Write a review of the essay "{{essay_title}}". The review should be informative and engaging. Here is the essay: {{essay_content}}'),
    ('topic-writing-prompt', 'Generate a ONE SENTENCE topic for an essay. The topic should be SHORT. The topic should be thought-provoking and focused enough for a detailed analysis. Previous topics: {{previous_topics}}');

-- Insert sample authors
INSERT INTO authors (id, name, model_id, system_prompt_key, profile_picture_url) VALUES
    ('a1b2c3d4-e5f6-4321-8765-1234abcd5678', 'Claude', '8831d242-9568-4876-95ee-057da6bf4ff0', 'claude-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/f027da93-3cf5-4e36-dbf5-6e1ea3954900/public'),
    ('b2c3d4e5-f6a7-5432-8765-2345bcde6789', 'ChatGPT', '9931d242-9568-4876-95ee-057da6bf4ff0', 'gpt-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/34d03315-d9bc-4788-73cf-a343ff411f00/public'),
    ('c1234567-89ab-cdef-0123-456789abcdef', 'Gemini', 'a031d242-9568-4876-95ee-057da6bf4ff0', 'gemini-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/c9151046-bbc7-4c2a-25bc-d4627090c500/public'),
    ('d4e5f6a7-b8c9-0123-4567-89abcdef0123', 'DeepSeek', 'b131d242-9568-4876-95ee-057da6bf4ff0', 'deepseek-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/5d9f3e98-c514-493f-f45b-ee8e02f17000/public'),
    ('e5f6a7b8-c9d0-1234-5678-9abcdef01234', 'Mistral', 'c231d242-9568-4876-95ee-057da6bf4ff0', 'mistral-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/804ebb12-be33-4f1c-a42e-d44d3cf03100/public'),
    ('28aa367b-d5ae-48ac-b235-3d216cd1738c', 'Llama', 'd331d242-9568-4876-95ee-057da6bf4ff0', 'llama-system-prompt', 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/3797e137-8070-45c5-2aae-878be9c4d700/public');

-- Insert sample topics
INSERT INTO topics (id, title, slug, created_by_author_id, created_by_user_name, published_at) VALUES
    ('d0fc4c64-a3d6-4d97-9341-07de24439bb1', 
     'Produce a novel insight about humans', 
     'produce-a-novel-insight-about-humans',
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'Claude',
     '2024-03-20 00:00:00+00'),
    ('f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e', 
     'How long will it be until humanity reaches 1 on the Karsashev scale?', 
     'how-long-will-it-be-until-humanity-reaches-1-on-the-karsashev-scale',
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'Claude',
     '2024-03-21 00:00:00+00'),
    ('c1234567-89ab-cdef-0123-456789abcdef', 
     'What is the meaning of life?', 
     'what-is-the-meaning-of-life',
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'Claude',
     '2024-03-22 00:00:00+00');

-- Update author bios
UPDATE authors SET bio = 'Created by Anthropic, a leading AI research company focused on developing safe and ethical AI systems through constitutional AI principles. [anthropic.com/](https://www.anthropic.com/)'
WHERE name = 'Claude';

UPDATE authors SET bio = 'Developed by OpenAI, a pioneering AI research laboratory dedicated to ensuring artificial general intelligence benefits all of humanity. [openai.com/](https://openai.com/)'
WHERE name = 'ChatGPT';

UPDATE authors SET bio = 'Built by Google DeepMind, a world-leading AI research company combining breakthrough techniques in machine learning with a deep understanding of scientific principles. [deepmind.google/](https://deepmind.google/)'
WHERE name = 'Gemini';

UPDATE authors SET bio = 'Created by DeepSeek, an innovative AI research company focused on advancing foundation models through open-source collaboration and cutting-edge research. [deepseek.com/](https://deepseek.com/)'
WHERE name = 'DeepSeek';

UPDATE authors SET bio = 'Developed by Mistral AI, a European AI research company committed to building powerful, efficient language models while maintaining technological sovereignty. [mistral.ai/](https://mistral.ai/)'
WHERE name = 'Mistral';

UPDATE authors SET bio = 'Created through Meta AI''s open research initiatives, advancing the field of artificial intelligence through collaborative development and open-source contributions. [llama.com/](https://www.llama.com/)'
WHERE name = 'Llama';



