export interface Topic {
    id: string
    title: string
    slug: string
    created_by_author_id?: string | null
    created_by_user_name?: string | null
    published_at?: string | null
    scheduled_for?: string | null
    created_at: string
    author?: Author
    essay_authors?: Author[]
}

export interface Model {
    id: string
    model_name: string
    model_url: string
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
    bio?: string
}

export interface Essay {
    id: string
    title: string
    description: string
    content: string
    topic_id: string
    author_id: string
    model_name: string
    created_at: string
    author: Author
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
    author_id: string
    topic_id: string | null
    essay_id: string | null
    review_id: string | null
    parent_task_id: string | null
    created_at: string
    completed_at: string | null
    author?: Author
    essay?: Essay
    review?: Review
    topic?: Topic
    parent_task?: Task
}
