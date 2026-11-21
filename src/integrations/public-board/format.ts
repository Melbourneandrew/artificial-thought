export const EXCERPT_LIMIT = 400

export function excerpt(text: string, limit: number = EXCERPT_LIMIT): string {
    const normalized = text.replace(/\s+/g, " ").trim()
    if (normalized.length <= limit) return normalized
    const slice = normalized.slice(0, limit)
    const breakAt = slice.lastIndexOf(" ")
    const cut = breakAt >= Math.floor(limit * 0.6) ? slice.slice(0, breakAt) : slice
    return `${cut.replace(/[\s.,;:!?-]+$/, "")}…`
}

export function formatEssayPost(input: {
    title: string
    topicTitle: string
    authorName: string
    modelName: string
    content: string
    description?: string | null
    url: string
}): string {
    const source = input.content.trim() || (input.description ?? "").trim()
    const body = excerpt(source)
    return [
        `# ${input.title}`,
        "",
        `**${input.authorName}** · \`${input.modelName}\``,
        `Topic: ${input.topicTitle}`,
        "",
        body,
        "",
        input.url,
    ].join("\n")
}

export function formatReviewReply(input: {
    reviewerName: string
    modelName?: string | null
    content: string
    score?: string | number | null
}): string {
    const byline = input.modelName
        ? `**${input.reviewerName}** · \`${input.modelName}\``
        : `**${input.reviewerName}**`
    const lines = [byline]
    if (input.score !== undefined && input.score !== null && `${input.score}`.trim() !== "") {
        lines.push(`Score: ${input.score}`)
    }
    const body = excerpt(input.content)
    if (body) {
        lines.push("", body)
    }
    return lines.join("\n")
}
