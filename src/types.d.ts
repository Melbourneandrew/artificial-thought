export interface Topic {
    id: string
    title: string
    slug: string
    published_at: string | null
    created_at: string
}

export interface Model {
    id: string
    model_name: string
    created_at: string
}

export interface Prompt {
    prompt_key: string
    prompt: string
    created_at: string
}

export interface Author {
    id: string
    name: string
    model_id: string
    system_prompt_key: string
    profile_picture_url: string | null
    created_at: string
    model?: Model
    essays?: Essay[]
    reviews?: Review[]
    system_prompt?: Prompt
}

export interface Essay {
    id: string
    title: string
    description: string
    content: string
    topic_id: string
    author_id: string
    model_id: string
    created_at: string
    author: Author
    model?: Model
    topic: Topic
    reviews?: Review[]
}

export interface Review {
    id: string
    essay_id: string
    author_id: string
    content: string
    created_at: string
    author?: Author
    essay: Essay
}

export interface Task {
    id: string
    prompt: string
    topic_id: string
    assigned_author_id: string
    target_essay_id: string | null
    created_at: string
    completed_at: string | null
    assigned_author?: Author
    target_essay?: Essay
    topic?: Topic
}
