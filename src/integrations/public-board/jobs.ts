import type { BoardCrosspostMessage } from "@/utils/bindings"
import { BoardApiError, createBoardClient, type PublicBoardApi } from "@/integrations/public-board/client"
import {
    canonicalEssayUrl,
    essayClientId,
    getBoardRuntimeConfig,
    reviewClientId,
} from "@/integrations/public-board/config"
import { formatEssayPost, formatReviewReply } from "@/integrations/public-board/format"
import {
    getEssayCrosspost,
    getReviewCrosspost,
    saveEssayCrosspost,
    saveReviewCrosspost,
} from "@/integrations/public-board/repo"
import { getEssayById } from "@/utils/repository/EssayRepo"
import { getReviewById } from "@/utils/repository/ReviewRepo"

export class CrosspostPendingError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "CrosspostPendingError"
    }
}

function shouldRetry(error: unknown): boolean {
    if (error instanceof CrosspostPendingError) return true
    if (error instanceof BoardApiError) return error.retryable
    return true
}

export async function executeBoardCrosspost(message: BoardCrosspostMessage): Promise<void> {
    const config = await getBoardRuntimeConfig()
    if (!config) {
        console.error("public-board: BOARD_TOKEN is not configured; skipped", message.kind, message.id)
        return
    }
    const api = createBoardClient({ url: config.url, token: config.token })
    try {
        if (message.kind === "essay") {
            await crosspostEssay(message.id, api, config.channel, config.siteUrl)
        } else {
            await crosspostReview(message.id, api)
        }
    } catch (error) {
        if (shouldRetry(error)) throw error
        console.error("public-board: giving up on", message.kind, message.id, error)
    }
}

export async function crosspostEssay(
    essayId: string,
    api: PublicBoardApi,
    channel: string,
    siteUrl: string,
): Promise<void> {
    const existing = await getEssayCrosspost(essayId)
    if (existing) return

    const essay = await getEssayById(essayId)
    if (!essay) {
        console.error("public-board: essay missing, skipping", essayId)
        return
    }
    if (!essay.topic.published_at) {
        console.error("public-board: essay topic is unpublished, skipping", essayId)
        return
    }

    const clientId = essayClientId(essay.id)
    const message = await api.post(
        channel,
        formatEssayPost({
            title: essay.title,
            topicTitle: essay.topic.title,
            authorName: essay.author.name,
            modelName: essay.model_name,
            content: essay.content,
            description: essay.description,
            url: canonicalEssayUrl(essay.id, siteUrl),
        }),
        clientId,
    )
    await saveEssayCrosspost(essay.id, message.id, clientId)
}

export async function crosspostReview(reviewId: string, api: PublicBoardApi): Promise<void> {
    const existing = await getReviewCrosspost(reviewId)
    if (existing) return

    const review = await getReviewById(reviewId)
    if (!review) {
        console.error("public-board: review missing, skipping", reviewId)
        return
    }

    const essayPost = await getEssayCrosspost(review.essay_id)
    if (!essayPost) {
        throw new CrosspostPendingError(`essay ${review.essay_id} is not on the board yet`)
    }

    const clientId = reviewClientId(review.id)
    const message = await api.reply(
        essayPost.board_message_id,
        formatReviewReply({
            reviewerName: review.author?.name || "Unknown reviewer",
            modelName: review.model_name,
            content: review.content,
        }),
        clientId,
    )
    await saveReviewCrosspost(review.id, review.essay_id, message.id, clientId)
}
