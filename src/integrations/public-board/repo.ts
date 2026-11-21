import { all, one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"

export type BoardCrosspost = {
    id: string
    kind: "essay" | "review"
    essay_id: string
    review_id: string | null
    board_message_id: string
    client_id: string
    created_at: string
}

export async function getEssayCrosspost(essayId: string): Promise<BoardCrosspost | null> {
    return one<BoardCrosspost>(
        `SELECT id, kind, essay_id, review_id, board_message_id, client_id, created_at
         FROM board_crossposts
         WHERE kind = 'essay' AND essay_id = ?`,
        essayId,
    )
}

export async function getReviewCrosspost(reviewId: string): Promise<BoardCrosspost | null> {
    return one<BoardCrosspost>(
        `SELECT id, kind, essay_id, review_id, board_message_id, client_id, created_at
         FROM board_crossposts
         WHERE kind = 'review' AND review_id = ?`,
        reviewId,
    )
}

export async function saveEssayCrosspost(essayId: string, boardMessageId: string, clientId: string): Promise<BoardCrosspost> {
    const existing = await getEssayCrosspost(essayId)
    if (existing) return existing
    const row: BoardCrosspost = {
        id: newId(),
        kind: "essay",
        essay_id: essayId,
        review_id: null,
        board_message_id: boardMessageId,
        client_id: clientId,
        created_at: nowIso(),
    }
    await run(
        `INSERT INTO board_crossposts (id, kind, essay_id, review_id, board_message_id, client_id, created_at)
         VALUES (?, 'essay', ?, NULL, ?, ?, ?)
         ON CONFLICT(client_id) DO NOTHING`,
        row.id,
        row.essay_id,
        row.board_message_id,
        row.client_id,
        row.created_at,
    )
    return (await getEssayCrosspost(essayId)) ?? row
}

export async function saveReviewCrosspost(
    reviewId: string,
    essayId: string,
    boardMessageId: string,
    clientId: string,
): Promise<BoardCrosspost> {
    const existing = await getReviewCrosspost(reviewId)
    if (existing) return existing
    const row: BoardCrosspost = {
        id: newId(),
        kind: "review",
        essay_id: essayId,
        review_id: reviewId,
        board_message_id: boardMessageId,
        client_id: clientId,
        created_at: nowIso(),
    }
    await run(
        `INSERT INTO board_crossposts (id, kind, essay_id, review_id, board_message_id, client_id, created_at)
         VALUES (?, 'review', ?, ?, ?, ?, ?)
         ON CONFLICT(client_id) DO NOTHING`,
        row.id,
        row.essay_id,
        row.review_id,
        row.board_message_id,
        row.client_id,
        row.created_at,
    )
    return (await getReviewCrosspost(reviewId)) ?? row
}

export async function listUnpublishedEssayIds(limit: number): Promise<string[]> {
    const rows = await all<{ id: string }>(
        `SELECT e.id
         FROM essays e
         JOIN topics t ON t.id = e.topic_id
         WHERE t.published_at IS NOT NULL
           AND NOT EXISTS (
               SELECT 1 FROM board_crossposts c
               WHERE c.kind = 'essay' AND c.essay_id = e.id
           )
         ORDER BY e.created_at ASC
         LIMIT ?`,
        limit,
    )
    return rows.map((row) => row.id)
}

export async function listUnpublishedReviewIds(limit: number): Promise<string[]> {
    const rows = await all<{ id: string }>(
        `SELECT r.id
         FROM reviews r
         JOIN board_crossposts c ON c.kind = 'essay' AND c.essay_id = r.essay_id
         WHERE NOT EXISTS (
               SELECT 1 FROM board_crossposts x
               WHERE x.kind = 'review' AND x.review_id = r.id
           )
         ORDER BY r.created_at ASC
         LIMIT ?`,
        limit,
    )
    return rows.map((row) => row.id)
}
