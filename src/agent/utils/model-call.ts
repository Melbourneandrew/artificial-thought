export const DEFAULT_REASONING_EFFORT = "low"

export type ToolSpec = {
    name: string
    description: string
    parameters: {
        type: "object"
        properties: Record<string, { type: "string"; description: string }>
        required: string[]
    }
}

export const writeEssayTool: ToolSpec = {
    name: "write_essay",
    description: "Submit the finished essay. Call this tool instead of writing the essay as plain text.",
    parameters: {
        type: "object",
        properties: {
            title: { type: "string", description: "The title of the essay." },
            description: { type: "string", description: "A short description of the essay." },
            body: { type: "string", description: "The full essay body." },
        },
        required: ["title", "description", "body"],
    },
}

export const submitReviewTool: ToolSpec = {
    name: "submit_review",
    description: "Submit the finished review. Call this tool instead of writing the review as plain text.",
    parameters: {
        type: "object",
        properties: {
            content: { type: "string", description: "The review text. One short paragraph, no markdown." },
        },
        required: ["content"],
    },
}

export const writeTopicTool: ToolSpec = {
    name: "write_topic",
    description: "Submit the essay topic. Call this tool instead of writing the topic as plain text.",
    parameters: {
        type: "object",
        properties: {
            title: { type: "string", description: "A short title-case topic sentence." },
        },
        required: ["title"],
    },
}

export function openAiTool(spec: ToolSpec) {
    return {
        type: "function" as const,
        function: {
            name: spec.name,
            description: spec.description,
            parameters: spec.parameters,
        },
    }
}

export function forcedToolChoice(name: string) {
    return {
        type: "function" as const,
        function: { name },
    }
}

/**
 * `skip` omits reasoning fields (the model has no reasoning control).
 * `off` disables thinking via the Workers AI chat template flag.
 * Any other value is sent as `reasoning_effort`. Null uses the default, which is `low`.
 */
export function reasoningFields(effort: string | null | undefined): Record<string, unknown> {
    const value = (effort ?? "").trim() || DEFAULT_REASONING_EFFORT
    if (value === "skip") return {}
    if (value === "off") {
        return { chat_template_kwargs: { enable_thinking: false } }
    }
    return { reasoning_effort: value }
}

function parseArguments(value: unknown): unknown | null {
    if (typeof value === "string") {
        try {
            return JSON.parse(value)
        } catch {
            return null
        }
    }
    if (value && typeof value === "object") return value
    return null
}

function toolCallsFromMessage(message: Record<string, unknown>): unknown | null {
    const calls = message.tool_calls ?? message.toolCalls
    if (Array.isArray(calls)) {
        for (const call of calls) {
            if (!call || typeof call !== "object") continue
            const record = call as Record<string, unknown>
            const fn = record.function && typeof record.function === "object"
                ? record.function as Record<string, unknown>
                : record
            const parsed = parseArguments(fn.arguments ?? record.arguments ?? record.input)
            if (parsed) return parsed
        }
    }
    const legacy = message.function_call
    if (legacy && typeof legacy === "object") {
        return parseArguments((legacy as Record<string, unknown>).arguments)
    }
    return null
}

export function extractToolArguments(payload: unknown): unknown | null {
    if (!payload || typeof payload !== "object") return null
    const record = payload as Record<string, unknown>
    const direct = toolCallsFromMessage(record)
    if (direct) return direct

    const choices = record.choices
    if (Array.isArray(choices)) {
        for (const choice of choices) {
            if (!choice || typeof choice !== "object") continue
            const message = (choice as Record<string, unknown>).message
            if (message && typeof message === "object") {
                const parsed = toolCallsFromMessage(message as Record<string, unknown>)
                if (parsed) return parsed
            }
            const parsed = toolCallsFromMessage(choice as Record<string, unknown>)
            if (parsed) return parsed
        }
    }
    if (record.message && typeof record.message === "object") {
        return toolCallsFromMessage(record.message as Record<string, unknown>)
    }
    return null
}

export function extractMessageText(payload: unknown): string {
    if (typeof payload === "string") return payload
    if (!payload || typeof payload !== "object") return ""
    const record = payload as Record<string, unknown>
    if (typeof record.response === "string") return record.response
    if (typeof record.result === "string") return record.result
    const choices = record.choices
    if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return ""
    const message = (choices[0] as { message?: { content?: unknown } }).message
    const content = message?.content
    if (typeof content === "string") return content
    if (!Array.isArray(content)) return ""
    return content.map((part) => {
        if (typeof part === "string") return part
        if (part && typeof part === "object" && "text" in part) return String((part as { text: unknown }).text)
        return ""
    }).join("")
}

export function parseJsonObject(text: string): unknown {
    const withoutFence = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
    const start = withoutFence.indexOf("{")
    const end = withoutFence.lastIndexOf("}")
    const slice = start >= 0 && end > start ? withoutFence.slice(start, end + 1) : withoutFence
    return JSON.parse(slice)
}
