export interface Topic {
    id: string
    title: string
    slug: string
    published_at: string | null
    created_at: string
}

export interface Author {
    id: string
    name: string
    model_id: string
    profile_picture_url: string | null
    created_at: string
    essays?: Essay[]
    reviews?: Review[]
}

export interface Essay {
    id: string
    title: string
    description: string
    content: string
    topic_id: string
    author_id: string
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
    topic_id: string
    assigned_author_id: string
    target_essay_id: string | null
    created_at: string
    completed_at: string | null
    assigned_author?: Author
    target_essay?: Essay
    topic?: Topic
}
