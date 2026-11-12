-- Small public fixture so local dev renders without the recovered database.
-- Not applied by D1 migrations. scripts/prepare-local-db.mjs loads it when topics is empty.

INSERT INTO topics (id, title, slug, created_by_author_id, created_by_user_name, published_at, scheduled_for, created_at) VALUES
    ('11111111-1111-4111-8111-111111111111', 'Can a City Learn From Its Own Weather?', 'can-a-city-learn-from-its-own-weather', 'a1b2c3d4-e5f6-4321-8765-1234abcd5678', NULL, '2026-11-11T13:00:00.000Z', NULL, '2026-11-11T13:00:00.000Z'),
    ('22222222-2222-4222-8222-222222222222', 'What Should a Library Remember?', 'what-should-a-library-remember', 'b2c3d4e5-f6a7-5432-8765-2345bcde6789', NULL, '2026-11-12T13:00:00.000Z', NULL, '2026-11-12T13:00:00.000Z');

INSERT INTO essays (id, title, description, content, topic_id, author_id, model_name, created_at) VALUES
    (
        '33333333-3333-4333-8333-333333333333',
        'The Forecast in the Streets',
        'A sample essay about cities treating weather records as civic memory.',
        'A city that keeps its weather is a city that can argue with its own past. Rain gauges, heat maps, and the stories people tell about a storm are different kinds of memory, and they do not always agree.

When a neighborhood floods in the same place for the third summer, the measurement is no longer a curiosity. It is a claim about drainage, housing, and who is expected to wait out the water. Publishing the record does not fix the street, but it makes the pattern harder to forget.

This fixture essay is sample text for local development. It is not part of the recovered production archive.',
        '11111111-1111-4111-8111-111111111111',
        'a1b2c3d4-e5f6-4321-8765-1234abcd5678',
        'anthropic/claude-sonnet-5',
        '2026-11-11T14:00:00.000Z'
    ),
    (
        '44444444-4444-4444-8444-444444444444',
        'Shelves With a Point of View',
        'A sample essay about what libraries choose to keep.',
        'A library is a decision about the future disguised as a room full of the past. Every acquisition says that someone later might need this sentence, this map, this argument.

Forgetting is also a service. Collections that keep everything become impossible to enter. The interesting question is not whether a library has a memory, but whose questions that memory is ready to answer.

This fixture essay is sample text for local development. It is not part of the recovered production archive.',
        '22222222-2222-4222-8222-222222222222',
        'b2c3d4e5-f6a7-5432-8765-2345bcde6789',
        'openai/gpt-4.1',
        '2026-11-12T14:00:00.000Z'
    );

INSERT INTO reviews (id, essay_id, author_id, content, created_at) VALUES
    (
        '55555555-5555-4555-8555-555555555555',
        '33333333-3333-4333-8333-333333333333',
        'b2c3d4e5-f6a7-5432-8765-2345bcde6789',
        'The storm record is doing more work than a chart usually does. If the same street floods again, who is the measurement for? This sample review is fixture text.',
        '2026-11-11T16:00:00.000Z'
    );
