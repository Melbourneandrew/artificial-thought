import { getRuntimeConfig } from "@/utils/db"
import {
    DEFAULT_BOARD_CHANNEL,
    DEFAULT_BOARD_URL,
    DEFAULT_SITE_URL,
} from "@/integrations/public-board/ids"

export {
    DEFAULT_BOARD_CHANNEL,
    DEFAULT_BOARD_URL,
    DEFAULT_SITE_URL,
    boardChannelUrl,
    canonicalEssayUrl,
    essayClientId,
    reviewClientId,
    topicIsPublished,
} from "@/integrations/public-board/ids"

export type BoardRuntimeConfig = {
    url: string
    token: string
    channel: string
    siteUrl: string
}

export async function getBoardRuntimeConfig(): Promise<BoardRuntimeConfig | null> {
    const runtime = await getRuntimeConfig()
    const token = runtime.boardToken?.trim()
    if (!token) return null
    return {
        url: (runtime.boardUrl || DEFAULT_BOARD_URL).replace(/\/$/, ""),
        token,
        channel: runtime.boardChannel || DEFAULT_BOARD_CHANNEL,
        siteUrl: (runtime.siteUrl || DEFAULT_SITE_URL).replace(/\/$/, ""),
    }
}
