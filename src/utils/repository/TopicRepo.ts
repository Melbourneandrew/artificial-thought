import { all, one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"
import { Author, Essay, Topic } from "@/types"
import { AuthorRow, authorSelect, mapAuthor } from "@/utils/repository/rows"

export interface TopicWithEssays extends Topic {
    essays: (Essay & { author: Author })[]
}

type TopicRow = {
    id: string
    title: string
    slug: string
    created_by_author_id: string | null
    created_by_user_name: string | null
    published_at: string | null
    scheduled_for: string | null
    created_at: string
}

function baseTopic(row: TopicRow): Topic {
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

async function authorForTopic(authorId: string | null): Promise<Author | undefined> {
    if (!authorId) return undefined
    const row = await one<AuthorRow>(
        `SELECT ${authorSelect}
         FROM authors a
         LEFT JOIN models m ON m.id = a.model_id
         LEFT JOIN prompts p ON p.prompt_key = a.system_prompt_key
         WHERE a.id = ?`,
        authorId,
    )
    return row ? mapAuthor(row) : undefined
}

async function essaysForTopic(topic: Topic): Promise<Essay[]> {
    const rows = await all<{
        id: string
        title: string
        description: string
        created_at: string
        model_name: string
        author_id: string
        author_name: string
        author_model_id: string | null
        author_profile_picture_url: string | null
        author_created_at: string
    }>(
        `SELECT e.id, e.title, e.description, e.created_at, e.model_name, e.author_id,
                a.name AS author_name, a.model_id AS author_model_id,
                a.profile_picture_url AS author_profile_picture_url, a.created_at AS author_created_at
         FROM essays e
         JOIN authors a ON a.id = e.author_id
         WHERE e.topic_id = ?
         ORDER BY e.created_at ASC`,
        topic.id,
    )
    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        content: "",
        topic_id: topic.id,
        author_id: row.author_id,
        model_name: row.model_name,
        created_at: row.created_at,
        topic,
        author: {
            id: row.author_id,
            name: row.author_name,
            model_id: row.author_model_id || "",
            system_prompt_key: "",
            profile_picture_url: row.author_profile_picture_url,
            created_at: row.author_created_at,
        },
    }))
}

async function essayAuthorsForTopics(topicIds: string[]): Promise<Map<string, Author[]>> {
    const grouped = new Map<string, Author[]>()
    if (topicIds.length === 0) return grouped
    const placeholders = topicIds.map(() => "?").join(", ")
    const rows = await all<{
        topic_id: string
        id: string
        name: string
        model_id: string | null
        profile_picture_url: string | null
        created_at: string
    }>(
        `SELECT DISTINCT e.topic_id, a.id, a.name, a.model_id, a.profile_picture_url, a.created_at
         FROM essays e
         JOIN authors a ON a.id = e.author_id
         WHERE e.topic_id IN (${placeholders})
         ORDER BY a.name`,
        ...topicIds,
    )
    for (const row of rows) {
        const list = grouped.get(row.topic_id) ?? []
        list.push({
            id: row.id,
            name: row.name,
            model_id: row.model_id || "",
            system_prompt_key: "",
            profile_picture_url: row.profile_picture_url,
            created_at: row.created_at,
        })
        grouped.set(row.topic_id, list)
    }
    return grouped
}

async function hydrateTopic(row: TopicRow, requireEssays: boolean): Promise<TopicWithEssays | null> {
    const essays = await essaysForTopic(baseTopic(row))
    if (requireEssays && essays.length === 0) return null
    const authors = await essayAuthorsForTopics([row.id])
    return {
        ...baseTopic(row),
        author: await authorForTopic(row.created_by_author_id),
        essay_authors: authors.get(row.id) ?? [],
        essays,
    }
}

export async function getMostRecentTopic(): Promise<TopicWithEssays | null> {
    const row = await one<TopicRow>(
        `SELECT * FROM topics
         WHERE published_at IS NOT NULL
           AND EXISTS (SELECT 1 FROM essays e WHERE e.topic_id = topics.id)
         ORDER BY published_at DESC
         LIMIT 1`,
    )
    return row ? hydrateTopic(row, true) : null
}

export async function getPreviousTopics(n: number = 5): Promise<Topic[]> {
    const rows = await all<TopicRow>(
        `SELECT * FROM topics ORDER BY published_at DESC LIMIT ?`,
        n,
    )
    return rows.map(baseTopic)
}

export async function getTopicBySlug(slug: string): Promise<TopicWithEssays | null> {
    const row = await one<TopicRow>(`SELECT * FROM topics WHERE slug = ?`, slug)
    return row ? hydrateTopic(row, false) : null
}

export async function getRandomTopic(): Promise<TopicWithEssays | null> {
    const row = await one<TopicRow>(
        `SELECT * FROM topics
         WHERE published_at IS NOT NULL
           AND EXISTS (SELECT 1 FROM essays e WHERE e.topic_id = topics.id)
         ORDER BY RANDOM()
         LIMIT 1`,
    )
    return row ? hydrateTopic(row, true) : null
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug || "topic"
    let counter = 1
    while (counter < 1000) {
        const existing = await one<{ slug: string }>(`SELECT slug FROM topics WHERE slug = ?`, slug)
        if (!existing) return slug
        slug = `${baseSlug}-${counter}`
        counter++
    }
    throw new Error("Unable to allocate a unique topic slug")
}

export async function createTopic(params: Omit<Topic, "id" | "created_at" | "slug">): Promise<Topic> {
    if (params.scheduled_for) {
        const existing = await one<{ id: string }>(
            `SELECT id FROM topics
             WHERE published_at IS NULL AND scheduled_for IS NOT NULL AND date(scheduled_for) = date(?)`,
            params.scheduled_for,
        )
        if (existing) throw new Error("A topic is already scheduled for this date")
    }

    const topic: Topic = {
        id: newId(),
        title: params.title,
        slug: await getUniqueSlug(slugify(params.title)),
        created_by_author_id: params.created_by_author_id ?? null,
        created_by_user_name: params.created_by_user_name ?? null,
        published_at: params.published_at ?? null,
        scheduled_for: params.scheduled_for ?? null,
        created_at: nowIso(),
    }
    await run(
        `INSERT INTO topics (id, title, slug, created_by_author_id, created_by_user_name, published_at, scheduled_for, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        topic.id,
        topic.title,
        topic.slug,
        topic.created_by_author_id ?? null,
        topic.created_by_user_name ?? null,
        topic.published_at ?? null,
        topic.scheduled_for ?? null,
        topic.created_at,
    )
    return topic
}

export async function getUserCreatedTopics(): Promise<Topic[]> {
    const rows = await all<TopicRow>(
        `SELECT * FROM topics WHERE created_by_author_id IS NULL ORDER BY created_at DESC`,
    )
    const authors = await essayAuthorsForTopics(rows.map((row) => row.id))
    return rows.map((row) => ({
        ...baseTopic(row),
        essay_authors: authors.get(row.id) ?? [],
    }))
}

export async function getPublishedTopics(page: number = 1, pageSize: number = 25): Promise<{
    topics: Topic[]
    total: number
}> {
    const offset = (page - 1) * pageSize
    const totalRow = await one<{ total: number }>(
        `SELECT COUNT(*) AS total FROM topics WHERE published_at IS NOT NULL`,
    )
    const rows = await all<TopicRow>(
        `SELECT * FROM topics
         WHERE published_at IS NOT NULL
         ORDER BY published_at DESC, created_at DESC
         LIMIT ? OFFSET ?`,
        pageSize,
        offset,
    )
    const creatorIds = rows.map((row) => row.created_by_author_id).filter((id): id is string => Boolean(id))
    const creators = new Map<string, Author>()
    if (creatorIds.length > 0) {
        const placeholders = creatorIds.map(() => "?").join(", ")
        const creatorRows = await all<AuthorRow>(
            `SELECT ${authorSelect}
             FROM authors a
             LEFT JOIN models m ON m.id = a.model_id
             LEFT JOIN prompts p ON p.prompt_key = a.system_prompt_key
             WHERE a.id IN (${placeholders})`,
            ...creatorIds,
        )
        for (const row of creatorRows) creators.set(row.id, mapAuthor(row))
    }
    const essayAuthors = await essayAuthorsForTopics(rows.map((row) => row.id))
    return {
        topics: rows.map((row) => ({
            ...baseTopic(row),
            author: row.created_by_author_id ? creators.get(row.created_by_author_id) : undefined,
            essay_authors: essayAuthors.get(row.id) ?? [],
        })),
        total: totalRow?.total || 0,
    }
}

export async function getTopicById(id: string): Promise<Topic | null> {
    const row = await one<TopicRow>(`SELECT * FROM topics WHERE id = ?`, id)
    return row ? baseTopic(row) : null
}

export async function getScheduledTopic(date: Date = new Date()): Promise<Topic | null> {
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        .toISOString()
        .split("T")[0]
    const row = await one<TopicRow>(
        `SELECT * FROM topics
         WHERE published_at IS NULL AND scheduled_for IS NOT NULL AND date(scheduled_for) = ?
         LIMIT 1`,
        today,
    )
    return row ? baseTopic(row) : null
}

export async function publishScheduledTopic(topic: Topic): Promise<Topic> {
    const publishedAt = nowIso()
    await run(`UPDATE topics SET published_at = ? WHERE id = ?`, publishedAt, topic.id)
    const updated = await getTopicById(topic.id)
    if (!updated) throw new Error("Failed to publish topic")
    return updated
}

export async function deleteTopicById(topicId: string): Promise<void> {
    const existing = await one<{ id: string }>(`SELECT id FROM topics WHERE id = ?`, topicId)
    if (!existing) throw new Error("Topic not found")
    await run(`DELETE FROM topics WHERE id = ?`, topicId)
}
