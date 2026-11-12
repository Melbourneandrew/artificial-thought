import { Author, Essay, Model, Prompt, Review, Topic } from "@/types"

export type AuthorRow = {
    id: string
    name: string
    model_id: string | null
    bio: string | null
    system_prompt_key: string
    profile_picture_url: string | null
    created_at: string
    model_row_id?: string | null
    model_name?: string | null
    model_url?: string | null
    model_created_at?: string | null
    prompt_text?: string | null
    prompt_created_at?: string | null
}

export function mapModel(row: { model_row_id?: string | null; model_name?: string | null; model_url?: string | null; model_created_at?: string | null }): Model | undefined {
    if (!row.model_row_id || !row.model_name || !row.model_url) return undefined
    return {
        id: row.model_row_id,
        model_name: row.model_name,
        model_url: row.model_url,
        created_at: row.model_created_at || "",
    }
}

export function mapPrompt(row: AuthorRow): Prompt | undefined {
    if (!row.prompt_text || !row.system_prompt_key) return undefined
    return {
        prompt_key: row.system_prompt_key,
        prompt: row.prompt_text,
        created_at: row.prompt_created_at || "",
    }
}

export function mapAuthor(row: AuthorRow): Author {
    return {
        id: row.id,
        name: row.name,
        model_id: row.model_id || "",
        system_prompt_key: row.system_prompt_key,
        profile_picture_url: row.profile_picture_url,
        created_at: row.created_at,
        bio: row.bio || undefined,
        model: mapModel(row),
        system_prompt: mapPrompt(row),
    }
}

export const authorSelect = `
    a.id,
    a.name,
    a.model_id,
    a.bio,
    a.system_prompt_key,
    a.profile_picture_url,
    a.created_at,
    m.id AS model_row_id,
    m.model_name,
    m.model_url,
    m.created_at AS model_created_at,
    p.prompt AS prompt_text,
    p.created_at AS prompt_created_at
`

export function mapTopic(row: Topic & { author_name?: string | null }): Topic {
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        created_by_author_id: row.created_by_author_id,
        created_by_user_name: row.created_by_user_name,
        published_at: row.published_at,
        scheduled_for: row.scheduled_for,
        created_at: row.created_at,
    }
}

export type EssayRow = {
    id: string
    title: string
    description: string
    content?: string | null
    topic_id: string
    author_id: string
    model_name: string
    created_at: string
    topic_title?: string | null
    topic_slug?: string | null
    topic_published_at?: string | null
    topic_created_at?: string | null
    author_name?: string | null
    author_model_id?: string | null
    author_profile_picture_url?: string | null
    author_created_at?: string | null
}

export function mapEssay(row: EssayRow): Essay {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        content: row.content || "",
        topic_id: row.topic_id,
        author_id: row.author_id,
        model_name: row.model_name,
        created_at: row.created_at,
        author: {
            id: row.author_id,
            name: row.author_name || "",
            model_id: row.author_model_id || "",
            system_prompt_key: "",
            profile_picture_url: row.author_profile_picture_url || null,
            created_at: row.author_created_at || "",
        },
        topic: {
            id: row.topic_id,
            title: row.topic_title || "",
            slug: row.topic_slug || "",
            created_at: row.topic_created_at || "",
            published_at: row.topic_published_at,
        },
    }
}

export const essayJoin = `
    FROM essays e
    JOIN authors a ON a.id = e.author_id
    JOIN topics t ON t.id = e.topic_id
`

export const essayColumns = `
    e.id,
    e.title,
    e.description,
    e.content,
    e.topic_id,
    e.author_id,
    e.model_name,
    e.created_at,
    t.title AS topic_title,
    t.slug AS topic_slug,
    t.published_at AS topic_published_at,
    t.created_at AS topic_created_at,
    a.name AS author_name,
    a.model_id AS author_model_id,
    a.profile_picture_url AS author_profile_picture_url,
    a.created_at AS author_created_at
`

export function mapReview(row: {
    id: string
    essay_id: string
    author_id: string
    content: string
    created_at: string
    author_name?: string | null
    author_model_id?: string | null
    author_profile_picture_url?: string | null
    author_created_at?: string | null
    essay_title?: string | null
    essay_description?: string | null
    essay_content?: string | null
    essay_model_name?: string | null
    essay_created_at?: string | null
    essay_author_id?: string | null
    essay_author_name?: string | null
    essay_author_profile_picture_url?: string | null
    essay_topic_id?: string | null
    essay_topic_title?: string | null
}): Review {
    return {
        id: row.id,
        essay_id: row.essay_id,
        author_id: row.author_id,
        content: row.content,
        created_at: row.created_at,
        author: {
            id: row.author_id,
            name: row.author_name || "",
            model_id: row.author_model_id || "",
            system_prompt_key: "",
            profile_picture_url: row.author_profile_picture_url || null,
            created_at: row.author_created_at || "",
        },
        essay: {
            id: row.essay_id,
            title: row.essay_title || "",
            description: row.essay_description || "",
            content: row.essay_content || "",
            topic_id: row.essay_topic_id || "",
            author_id: row.essay_author_id || "",
            model_name: row.essay_model_name || "",
            created_at: row.essay_created_at || "",
            author: {
                id: row.essay_author_id || "",
                name: row.essay_author_name || "",
                model_id: "",
                system_prompt_key: "",
                profile_picture_url: row.essay_author_profile_picture_url || null,
                created_at: "",
            },
            topic: {
                id: row.essay_topic_id || "",
                title: row.essay_topic_title || "",
                slug: "",
                created_at: "",
            },
        },
    }
}
