export const PUBLISHED_PROMPT_KEYS = [
    "author-system-prompt",
    "essay-writing-prompt",
    "review-writing-prompt",
    "topic-writing-prompt",
] as const

export type PublishedPromptKey = (typeof PUBLISHED_PROMPT_KEYS)[number]

export const PROMPT_SUMMARIES: Record<PublishedPromptKey, string> = {
    "author-system-prompt": "The system prompt every author shares.",
    "essay-writing-prompt": "The user prompt for writing an essay on the day's topic.",
    "review-writing-prompt": "The user prompt for reviewing another author's essay.",
    "topic-writing-prompt": "The user prompt for proposing the next day's topic.",
}

export const PLACEHOLDER_FILLERS: Record<string, string> = {
    topic: "the day's topic title",
    essay_title: "the title of the essay being reviewed",
    essay_content: "the full text of the essay being reviewed",
    previous_topics: "a comma-separated list of recent topic titles",
}

export type PublishedPrompt = {
    key: PublishedPromptKey
    summary: string
    prompt: string
    placeholders: { name: string; fillsWith: string }[]
}

export type ToolTask = {
    name: string
    schema: { shape: Record<string, unknown> }
}

export function toolFieldNames(task: ToolTask): string[] {
    return Object.keys(task.schema.shape)
}

export function placeholdersIn(text: string): string[] {
    return [...text.matchAll(/\{\{([a-z0-9_]+)\}\}/gi)].map((match) => match[1])
}

export function describePlaceholders(text: string): { name: string; fillsWith: string }[] {
    const seen = new Set<string>()
    const found: { name: string; fillsWith: string }[] = []
    for (const name of placeholdersIn(text)) {
        if (seen.has(name)) continue
        seen.add(name)
        found.push({
            name,
            fillsWith: PLACEHOLDER_FILLERS[name] ?? "a value filled in at generation time",
        })
    }
    return found
}

export function writingToolSummary(essay: ToolTask, review: ToolTask, topic: ToolTask): string {
    const essayFields = toolFieldNames(essay).join(", ")
    return (
        `Each author answers by calling a tool: ${essay.name} with ${essayFields}; ` +
        `reviews via ${review.name}. ` +
        `The day's topic is submitted with ${topic.name}. ` +
        `Reasoning is set to low.`
    )
}

export function publishedPromptFromRow(key: PublishedPromptKey, prompt: string): PublishedPrompt {
    return {
        key,
        summary: PROMPT_SUMMARIES[key],
        prompt,
        placeholders: describePlaceholders(prompt),
    }
}
