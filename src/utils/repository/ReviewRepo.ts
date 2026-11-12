import { bumpPublicCache } from "@/utils/bump-public-cache"
import { one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"
import { Review } from "@/types"
import { mapReview } from "@/utils/repository/rows"

const reviewSelect = `
    SELECT r.id, r.essay_id, r.author_id, r.content, r.created_at,
           a.name AS author_name, a.model_id AS author_model_id,
           a.profile_picture_url AS author_profile_picture_url, a.created_at AS author_created_at,
           e.title AS essay_title, e.description AS essay_description, e.content AS essay_content,
           e.model_name AS essay_model_name, e.created_at AS essay_created_at,
           ea.id AS essay_author_id, ea.name AS essay_author_name,
           ea.profile_picture_url AS essay_author_profile_picture_url,
           t.id AS essay_topic_id, t.title AS essay_topic_title
    FROM reviews r
    JOIN authors a ON a.id = r.author_id
    JOIN essays e ON e.id = r.essay_id
    JOIN authors ea ON ea.id = e.author_id
    JOIN topics t ON t.id = e.topic_id
`

export async function createReview(review: {
    essay_id: string
    author_id: string
    content: string
}): Promise<Review> {
    const id = newId()
    await run(
        `INSERT INTO reviews (id, essay_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)`,
        id,
        review.essay_id,
        review.author_id,
        review.content,
        nowIso(),
    )
    const created = await getReviewById(id)
    if (!created) throw new Error("Failed to create review")
    await bumpPublicCache()
    return created
}

export async function getReviewById(id: string): Promise<Review | null> {
    const row = await one<Parameters<typeof mapReview>[0]>(`${reviewSelect} WHERE r.id = ?`, id)
    return row ? mapReview(row) : null
}

export async function getReviewByEssayAndAuthor(essayId: string, authorId: string): Promise<Review | null> {
    const row = await one<Parameters<typeof mapReview>[0]>(
        `${reviewSelect} WHERE r.essay_id = ? AND r.author_id = ?`,
        essayId,
        authorId,
    )
    return row ? mapReview(row) : null
}
