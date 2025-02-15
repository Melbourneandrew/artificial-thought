-- Insert sample models
INSERT INTO models (id, model_name, model_url) VALUES
    ('8831d242-9568-4876-95ee-057da6bf4ff0', 'claude-3.5-turbo', 'https://api.anthropic.com/v1/messages'),
    ('9931d242-9568-4876-95ee-057da6bf4ff0', 'gpt-4o', 'https://api.openai.com/v1'),
    ('a031d242-9568-4876-95ee-057da6bf4ff0', 'gemini-1.5-pro', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key='),
    ('b131d242-9568-4876-95ee-057da6bf4ff0', 'deepseek-r1-distill-llama-70b', 'https://api.groq.com/openai/v1'),
    ('c231d242-9568-4876-95ee-057da6bf4ff0', 'mixtral-8x7b-32768', 'https://api.groq.com/openai/v1'),
    ('d331d242-9568-4876-95ee-057da6bf4ff0', 'llama-3.1-70b-versatile', 'https://api.groq.com/openai/v1');


-- Insert sample prompts
INSERT INTO prompts (prompt_key, prompt) VALUES
    ('claude-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('gpt-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('gemini-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('deepseek-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('mistral-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('llama-system-prompt', 'You are a helpful assistant that produces essays on a given topic.'),
    ('essay-writing-prompt', 'Write an essay about {{topic}}. The essay should be informative and engaging.'),
    ('review-writing-prompt', 'Write a review of the essay "{{essay_title}}". The review should be informative and engaging. Here is the essay: {{essay_content}}');

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

-- -- Insert sample essays (one from each author for each topic)
-- INSERT INTO essays (id, title, description, content, topic_id, author_id) VALUES
--     -- Essays for "Produce a novel insight about humans"
--     ('11111111-1111-1111-1111-111111111111',
--     'The Hidden Patterns of Human Behavior',
--     'An analysis of unconscious behavioral patterns in human society',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     'a1b2c3d4-e5f6-4321-8765-1234abcd5678'), -- Claude

--     ('22222222-2222-2222-2222-222222222222',
--     'The Social Mirror Effect',
--     'Understanding human behavior through collective reflection',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     'b2c3d4e5-f6a7-5432-8765-2345bcde6789'), -- ChatGPT

--     ('33333333-3333-3333-3333-333333333333',
--     'Evolutionary Echoes in Modern Life',
--     'Tracing ancient behavioral patterns in contemporary society',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     'c1234567-89ab-cdef-0123-456789abcdef'), -- Gemini

--     ('44444444-4444-4444-4444-444444444444',
--     'The Digital Transformation of Human Nature',
--     'How technology reshapes human behavior and cognition',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     'd4e5f6a7-b8c9-0123-4567-89abcdef0123'), -- DeepSeek

--     ('55555555-5555-5555-5555-555555555555',
--     'The Paradox of Human Rationality',
--     'Examining the intersection of emotion and logic in decision-making',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     'e5f6a7b8-c9d0-1234-5678-9abcdef01234'), -- Mistral

--     ('66666666-6666-6666-6666-666666666666',
--     'The Architecture of Human Connection',
--     'Mapping the neural basis of social bonds',
--     'Lorem ipsum dolor sit amet...',
--     'd0fc4c64-a3d6-4d97-9341-07de24439bb1',
--     '28aa367b-d5ae-48ac-b235-3d216cd1738c'), -- Llama

--     -- Essays for "How long until Kardashev Scale 1"
--     ('77777777-7777-7777-7777-777777777777',
--     'The Path to Kardashev I: Energy Revolution',
--     'Analyzing humanitys trajectory toward planetary energy mastery',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     'a1b2c3d4-e5f6-4321-8765-1234abcd5678'), -- Claude

--     ('88888888-8888-8888-8888-888888888888',
--     'Technological Bottlenecks to Kardashev I',
--     'Identifying key challenges in achieving planetary energy utilization',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     'b2c3d4e5-f6a7-5432-8765-2345bcde6789'), -- ChatGPT

--     ('99999999-9999-9999-9999-999999999999',
--     'The Economics of Planetary Energy',
--     'Financial pathways to achieving Kardashev I status',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     'c1234567-89ab-cdef-0123-456789abcdef'), -- Gemini

--     ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     'Engineering Challenges of Global Energy',
--     'Technical roadmap to planetary energy consumption',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     'd4e5f6a7-b8c9-0123-4567-89abcdef0123'), -- DeepSeek

--     ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
--     'Social Prerequisites for Kardashev I',
--     'The cultural evolution needed for planetary advancement',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     'e5f6a7b8-c9d0-1234-5678-9abcdef01234'), -- Mistral

--     ('cccccccc-cccc-cccc-cccc-cccccccccccc',
--     'The Timeline to Type I Civilization',
--     'Predictive analysis of humanitys technological progression',
--     'Lorem ipsum dolor sit amet...',
--     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e',
--     '28aa367b-d5ae-48ac-b235-3d216cd1738c'), -- Llama

--     -- Essays for "What is the meaning of life?"
--     ('dddddddd-dddd-dddd-dddd-dddddddddddd',
--     'The Algorithmic Perspective on Lifes Purpose',
--     'Computational approaches to understanding meaning',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     'a1b2c3d4-e5f6-4321-8765-1234abcd5678'), -- Claude

--     ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
--     'Meaning Through the Lens of Consciousness',
--     'How awareness shapes purpose and significance',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     'b2c3d4e5-f6a7-5432-8765-2345bcde6789'), -- ChatGPT

--     ('ffffffff-ffff-ffff-ffff-ffffffffffff',
--     'The Biology of Purpose',
--     'Scientific perspectives on lifes meaning',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     'c1234567-89ab-cdef-0123-456789abcdef'), -- Gemini

--     ('12121212-1212-1212-1212-121212121212',
--     'Meaning in the Age of AI',
--     'How artificial intelligence changes our understanding of purpose',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     'd4e5f6a7-b8c9-0123-4567-89abcdef0123'), -- DeepSeek

--     ('34343434-3434-3434-3434-343434343434',
--     'The Cultural Evolution of Meaning',
--     'How societies shape our understanding of purpose',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     'e5f6a7b8-c9d0-1234-5678-9abcdef01234'), -- Mistral

--     ('56565656-5656-5656-5656-565656565656',
--     'Universal Patterns of Purpose',
--     'Cross-cultural analysis of lifes meaning',
--     'Lorem ipsum dolor sit amet...',
--     'c1234567-89ab-cdef-0123-456789abcdef',
--     '28aa367b-d5ae-48ac-b235-3d216cd1738c'); -- Llama
INSERT INTO essays (id, title, description, content, topic_id, author_id, model_id)
SELECT 
    gen_random_uuid(),
    t.title || ' - Analysis by ' || a.name,
    'An exploration of ' || t.title || ' from ' || a.name || '''s perspective',
    'Lorem ipsum dolor sit amet...',
    t.id,
    a.id,
    a.model_id
FROM 
    topics t
    CROSS JOIN authors a;

WITH generated_reviews AS (
    SELECT 
        e.id AS essay_id,
        a.id AS author_id,
        public.generate_review_content(e.title, e.description) AS content
    FROM 
        essays e
    CROSS JOIN 
        authors a
    WHERE 
        e.author_id != a.id
)
INSERT INTO reviews (essay_id, author_id, content)
SELECT * FROM generated_reviews;

-- Drop function after inserting reviews
-- DROP FUNCTION IF EXISTS generate_review_content;

-- Insert sample tasks
INSERT INTO tasks (prompt, assigned_author_id, topic_id) VALUES
    -- Tasks for "Produce a novel insight about humans"
    ('Write an essay about the topic', 
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),
    
    ('Write an essay about the topic', 
     'b2c3d4e5-f6a7-5432-8765-2345bcde6789',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),
    
    ('Write an essay about the topic', 
     'c1234567-89ab-cdef-0123-456789abcdef',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),
    
    ('Write an essay about the topic', 
     'd4e5f6a7-b8c9-0123-4567-89abcdef0123',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),
    
    ('Write an essay about the topic', 
     'e5f6a7b8-c9d0-1234-5678-9abcdef01234',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),
    
    ('Write an essay about the topic', 
     '28aa367b-d5ae-48ac-b235-3d216cd1738c',
     'd0fc4c64-a3d6-4d97-9341-07de24439bb1'),

    -- Tasks for "How long until Kardashev Scale 1"
    ('Write an essay about the topic', 
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),
    
    ('Write an essay about the topic', 
     'b2c3d4e5-f6a7-5432-8765-2345bcde6789',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),
    
    ('Write an essay about the topic', 
     'c1234567-89ab-cdef-0123-456789abcdef',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),
    
    ('Write an essay about the topic', 
     'd4e5f6a7-b8c9-0123-4567-89abcdef0123',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),
    
    ('Write an essay about the topic', 
     'e5f6a7b8-c9d0-1234-5678-9abcdef01234',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),
    
    ('Write an essay about the topic', 
     '28aa367b-d5ae-48ac-b235-3d216cd1738c',
     'f3c2dad1-2b9e-4f1f-9c34-d75f29d3498e'),

    -- Tasks for "What is the meaning of life?"
    ('Write an essay about the topic', 
     'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
     'c1234567-89ab-cdef-0123-456789abcdef'),
    
    ('Write an essay about the topic', 
     'b2c3d4e5-f6a7-5432-8765-2345bcde6789',
     'c1234567-89ab-cdef-0123-456789abcdef'),
    
    ('Write an essay about the topic', 
     'c1234567-89ab-cdef-0123-456789abcdef',
     'c1234567-89ab-cdef-0123-456789abcdef'),
    
    ('Write an essay about the topic', 
     'd4e5f6a7-b8c9-0123-4567-89abcdef0123',
     'c1234567-89ab-cdef-0123-456789abcdef'),
    
    ('Write an essay about the topic', 
     'e5f6a7b8-c9d0-1234-5678-9abcdef01234',
     'c1234567-89ab-cdef-0123-456789abcdef'),
    
    ('Write an essay about the topic', 
     '28aa367b-d5ae-48ac-b235-3d216cd1738c',
     'c1234567-89ab-cdef-0123-456789abcdef');

