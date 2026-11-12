import { all, one, run } from "@/utils/db"
import { Author } from "@/types"
import { AuthorRow, authorSelect, mapAuthor } from "@/utils/repository/rows"

const authorFrom = `
    FROM authors a
    LEFT JOIN models m ON m.id = a.model_id
    LEFT JOIN prompts p ON p.prompt_key = a.system_prompt_key
`

export async function getAllAuthors(): Promise<Author[]> {
    const rows = await all<AuthorRow>(`SELECT ${authorSelect} ${authorFrom} ORDER BY a.name`)
    return rows.map(mapAuthor)
}

export async function getAuthorById(id: string): Promise<Author | null> {
    const row = await one<AuthorRow>(`SELECT ${authorSelect} ${authorFrom} WHERE a.id = ?`, id)
    return row ? mapAuthor(row) : null
}

export async function getAuthorWithEssaysAndReviews(id: string): Promise<Author | null> {
    const author = await getAuthorById(id)
    if (!author) return null

    const essays = await all<{
        id: string
        title: string
        description: string
        content: string
        model_name: string
        created_at: string
        topic_id: string
        topic_title: string
        topic_slug: string
        topic_published_at: string | null
    }>(
        `SELECT e.id, e.title, e.description, e.content, e.model_name, e.created_at,
                t.id AS topic_id, t.title AS topic_title, t.slug AS topic_slug, t.published_at AS topic_published_at
         FROM essays e
         JOIN topics t ON t.id = e.topic_id
         WHERE e.author_id = ?
         ORDER BY e.created_at DESC`,
        id,
    )

    const reviews = await all<{
        id: string
        content: string
        created_at: string
        essay_id: string
        essay_title: string
        essay_description: string
        essay_model_name: string
        topic_id: string
        topic_title: string
        essay_author_id: string
        essay_author_name: string
        essay_author_model_id: string | null
        essay_author_profile_picture_url: string | null
    }>(
        `SELECT r.id, r.content, r.created_at, e.id AS essay_id, e.title AS essay_title,
                e.description AS essay_description, e.model_name AS essay_model_name,
                t.id AS topic_id, t.title AS topic_title,
                ea.id AS essay_author_id, ea.name AS essay_author_name, ea.model_id AS essay_author_model_id,
                ea.profile_picture_url AS essay_author_profile_picture_url
         FROM reviews r
         JOIN essays e ON e.id = r.essay_id
         JOIN topics t ON t.id = e.topic_id
         JOIN authors ea ON ea.id = e.author_id
         WHERE r.author_id = ?
         ORDER BY r.created_at DESC`,
        id,
    )

    author.essays = essays.map((essay) => ({
        id: essay.id,
        title: essay.title,
        description: essay.description,
        content: essay.content,
        topic_id: essay.topic_id,
        author_id: id,
        model_name: essay.model_name,
        created_at: essay.created_at,
        author,
        topic: {
            id: essay.topic_id,
            title: essay.topic_title,
            slug: essay.topic_slug,
            published_at: essay.topic_published_at,
            created_at: essay.created_at,
        },
    }))

    author.reviews = reviews.map((review) => ({
        id: review.id,
        essay_id: review.essay_id,
        author_id: id,
        content: review.content,
        created_at: review.created_at,
        author,
        essay: {
            id: review.essay_id,
            title: review.essay_title,
            description: review.essay_description,
            content: "",
            topic_id: review.topic_id,
            author_id: review.essay_author_id,
            model_name: review.essay_model_name,
            created_at: review.created_at,
            topic: {
                id: review.topic_id,
                title: review.topic_title,
                slug: "",
                created_at: review.created_at,
            },
            author: {
                id: review.essay_author_id,
                name: review.essay_author_name,
                model_id: review.essay_author_model_id || "",
                system_prompt_key: "",
                profile_picture_url: review.essay_author_profile_picture_url,
                created_at: "",
            },
        },
    }))

    return author
}

export async function setModelAuthors(modelId: string, authorIds: string[]): Promise<void> {
    await run(`UPDATE authors SET model_id = NULL WHERE model_id = ?`, modelId)
    if (authorIds.length === 0) return
    const placeholders = authorIds.map(() => "?").join(", ")
    await run(
        `UPDATE authors SET model_id = ? WHERE id IN (${placeholders})`,
        modelId,
        ...authorIds,
    )
}
