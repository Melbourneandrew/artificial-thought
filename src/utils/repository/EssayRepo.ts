import { bumpPublicCache } from "@/utils/bump-public-cache"
import { all, one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"
import { Essay } from "@/types"
import { EssayRow, essayColumns, essayJoin, mapEssay, mapReview } from "@/utils/repository/rows"

export async function getAllEssays(page: number = 1, pageSize: number = 25): Promise<{
    essays: Essay[]
    total: number
}> {
    const offset = (page - 1) * pageSize
    const totalRow = await one<{ total: number }>(`SELECT COUNT(*) AS total FROM essays`)
    const rows = await all<EssayRow>(
        `SELECT ${essayColumns} ${essayJoin} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
        pageSize,
        offset,
    )
    return {
        essays: rows.map(mapEssay),
        total: totalRow?.total || 0,
    }
}

export async function getEssayById(id: string): Promise<Essay | null> {
    const row = await one<EssayRow>(`SELECT ${essayColumns} ${essayJoin} WHERE e.id = ?`, id)
    return row ? mapEssay(row) : null
}

export async function getEssayWithReviews(id: string): Promise<Essay | null> {
    const essay = await getEssayById(id)
    if (!essay) return null

    const reviews = await all<{
        id: string
        essay_id: string
        author_id: string
        content: string
        created_at: string
        author_name: string
        author_model_id: string | null
        author_profile_picture_url: string | null
        author_created_at: string
    }>(
        `SELECT r.id, r.essay_id, r.author_id, r.content, r.created_at,
                a.name AS author_name, a.model_id AS author_model_id,
                a.profile_picture_url AS author_profile_picture_url, a.created_at AS author_created_at
         FROM reviews r
         JOIN authors a ON a.id = r.author_id
         WHERE r.essay_id = ?
         ORDER BY r.created_at ASC`,
        id,
    )

    essay.reviews = reviews.map((review) => mapReview({
        ...review,
        essay_title: essay.title,
        essay_description: essay.description,
        essay_content: essay.content,
        essay_model_name: essay.model_name,
        essay_created_at: essay.created_at,
        essay_author_id: essay.author.id,
        essay_author_name: essay.author.name,
        essay_author_profile_picture_url: essay.author.profile_picture_url,
        essay_topic_id: essay.topic.id,
        essay_topic_title: essay.topic.title,
    }))
    return essay
}

export async function createEssay(essay: {
    title: string
    description: string
    content: string
    topic_id: string
    author_id: string
    model_name: string
}): Promise<Essay> {
    const id = newId()
    const createdAt = nowIso()
    await run(
        `INSERT INTO essays (id, title, description, content, topic_id, author_id, model_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        essay.title,
        essay.description,
        essay.content,
        essay.topic_id,
        essay.author_id,
        essay.model_name,
        createdAt,
    )
    const created = await getEssayById(id)
    if (!created) throw new Error("Failed to create essay")
    await bumpPublicCache()
    return created
}

export async function getUnreviewedEssay(authorId: string): Promise<Essay | null> {
    const row = await one<EssayRow>(
        `SELECT ${essayColumns} ${essayJoin}
         WHERE e.id NOT IN (SELECT essay_id FROM reviews WHERE author_id = ?)
         ORDER BY e.created_at DESC
         LIMIT 1`,
        authorId,
    )
    return row ? mapEssay(row) : null
}
