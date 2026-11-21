export const DEFAULT_BOARD_URL = "https://the-public-board.vercel.app/api/board"
export const DEFAULT_BOARD_CHANNEL = "artificial-thought"
export const DEFAULT_SITE_URL = "https://artificial-thought.com"

export function canonicalEssayUrl(essayId: string, siteUrl: string = DEFAULT_SITE_URL): string {
    return `${siteUrl.replace(/\/$/, "")}/essays/${essayId}`
}

export function boardChannelUrl(channel: string = DEFAULT_BOARD_CHANNEL): string {
    return `https://the-public-board.vercel.app/${channel}`
}

export function essayClientId(essayId: string): string {
    return `at-essay-${essayId}`
}

export function reviewClientId(reviewId: string): string {
    return `at-review-${reviewId}`
}

export function topicIsPublished(topic: { published_at?: string | null } | null | undefined): boolean {
    return Boolean(topic?.published_at)
}
