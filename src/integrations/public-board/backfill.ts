import { listUnpublishedEssayIds, listUnpublishedReviewIds } from "@/integrations/public-board/repo"
import { tryEnqueueBoardCrosspost } from "@/integrations/public-board/queue"

export const BACKFILL_BATCH = 200

export async function enqueueBoardBackfill(limit: number = BACKFILL_BATCH): Promise<{ essays: number; reviews: number }> {
    const essayIds = await listUnpublishedEssayIds(limit)
    for (const id of essayIds) {
        await tryEnqueueBoardCrosspost("essay", id)
    }
    const reviewIds = await listUnpublishedReviewIds(limit)
    for (const id of reviewIds) {
        await tryEnqueueBoardCrosspost("review", id)
    }
    return { essays: essayIds.length, reviews: reviewIds.length }
}
