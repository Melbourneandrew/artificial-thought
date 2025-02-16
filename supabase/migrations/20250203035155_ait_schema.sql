create table prompts (
    prompt_key text primary key,
    prompt text not null,
    created_at timestamp with time zone default now() not null
);

create table models (
    id uuid primary key default gen_random_uuid(),
    model_name text not null,
    model_url text not null,
    created_at timestamp with time zone default now() not null
);

create table authors (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    model_id uuid references models(id),
    system_prompt_key text references prompts(prompt_key) not null,
    profile_picture_url text,
    created_at timestamp with time zone default now() not null
);

create table topics (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    created_by_author_id uuid references authors(id),
    created_by_user_name text,
    published_at timestamp with time zone,
    created_at timestamp with time zone default now() not null
);

create table essays (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    content text not null,
    topic_id uuid references topics(id) not null,
    author_id uuid references authors(id) not null,
    model_id uuid references models(id) not null,
    created_at timestamp with time zone default now() not null
);

create table reviews (
    id uuid primary key default gen_random_uuid(),
    essay_id uuid references essays(id) not null,
    author_id uuid references authors(id) not null,
    content text not null,
    created_at timestamp with time zone default now() not null,
    unique(essay_id, author_id)
);

create table tasks (
    id uuid primary key default gen_random_uuid(),
    prompt text not null,
    topic_id uuid references topics(id) not null,
    assigned_author_id uuid references authors(id) not null,
    target_essay_id uuid references essays(id),
    created_at timestamp with time zone default now() not null,
    completed_at timestamp with time zone,
    unique(assigned_author_id, target_essay_id)
);


-- Create indexes for foreign keys to improve query performance
create index essays_topic_id_idx on essays(topic_id);
create index essays_author_id_idx on essays(author_id);
create index reviews_essay_id_idx on reviews(essay_id);
create index reviews_author_id_idx on reviews(author_id);

-- Create indexes for task foreign keys
create index tasks_assigned_author_id_idx on tasks(assigned_author_id);
create index tasks_target_essay_id_idx on tasks(target_essay_id);

CREATE FUNCTION public.generate_review_content(essay_title TEXT, essay_description TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'This essay on "' || essay_title || '" presents ' || 
            essay_description || '. The analysis is thorough and provides valuable insights into the topic.';
END;
$$ LANGUAGE plpgsql;
