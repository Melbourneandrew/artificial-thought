import type { Essay, Review } from "@/types"
import { all } from "@/utils/db"
import { topicIsPublished } from "@/integrations/public-board/ids"
import { tryEnqueueBoardCrosspost } from "@/integrations/public-board/queue"
import { getEssayCrosspost } from "@/integrations/public-board/repo"

export { topicIsPublished } from "@/integrations/public-board/ids"

export async function scheduleEssayCrosspost(essay: Pick<Essay, "id" | "topic">): Promise<void> {
    try {
        if (!topicIsPublished(essay.topic)) return
        const existing = await getEssayCrosspost(essay.id)
        if (existing) return
        await tryEnqueueBoardCrosspost("essay", essay.id)
    } catch (error) {
        console.error("public-board: failed to schedule essay crosspost", essay.id, error)
    }
}

export async function scheduleReviewCrosspost(review: Pick<Review, "id" | "essay_id">): Promise<void> {
    try {
        await tryEnqueueBoardCrosspost("review", review.id)
    } catch (error) {
        console.error("public-board: failed to schedule review crosspost", review.id, error)
    }
}

export async function scheduleTopicCrossposts(topicId: string): Promise<void> {
    try {
        const essays = await all<{ id: string }>(`SELECT id FROM essays WHERE topic_id = ? ORDER BY created_at ASC`, topicId)
        for (const essay of essays) {
            await tryEnqueueBoardCrosspost("essay", essay.id)
        }
        if (essays.length === 0) return
        const placeholders = essays.map(() => "?").join(", ")
        const reviews = await all<{ id: string }>(
            `SELECT id FROM reviews WHERE essay_id IN (${placeholders}) ORDER BY created_at ASC`,
            ...essays.map((essay) => essay.id),
        )
        for (const review of reviews) {
            await tryEnqueueBoardCrosspost("review", review.id)
        }
    } catch (error) {
        console.error("public-board: failed to schedule topic crossposts", topicId, error)
    }
}
