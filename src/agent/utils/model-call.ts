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

/**
 * Request shape AI Gateway expects for a model on the `env.AI.run` path.
 * The binding passes the input through in the model's native format, so
 * Anthropic models take Messages and some OpenAI and Meta models take Responses
 * (GPT-6.x tool calling requires the Responses API). Everything else,
 * including every Workers AI `@cf/` model, takes OpenAI chat completions.
 */
export type ApiFormat = "chat" | "anthropic" | "responses"

export function apiFormatFor(modelId: string): ApiFormat {
    const id = modelId.trim().toLowerCase()
    if (id.startsWith("anthropic/")) return "anthropic"
    if (/^openai\/gpt-(6|5\.6)/.test(id)) return "responses"
    if (/^meta\/muse-(spark|wonder)/.test(id)) return "responses"
    return "chat"
}

export function isWorkersAiModel(modelId: string): boolean {
    return modelId.trim().startsWith("@cf/")
}

/** REST path for the same request shape when the binding is not available. */
export function restPathFor(format: ApiFormat): string {
    if (format === "anthropic") return "ai/v1/messages"
    if (format === "responses") return "ai/v1/responses"
    return "ai/v1/chat/completions"
}

type InputMessage = { role: "system" | "user" | "assistant"; content: string }

const EFFORT_LEVELS = new Set(["none", "minimal", "low", "medium", "high", "xhigh", "max"])

function effortValue(effort: string | null | undefined): string | null {
    const value = (effort ?? "").trim() || DEFAULT_REASONING_EFFORT
    if (value === "skip") return null
    if (value === "off") return "none"
    return EFFORT_LEVELS.has(value) ? value : DEFAULT_REASONING_EFFORT
}

/**
 * Anthropic models that reject tool_choice "tool"/"any" with a 400
 * ("Forced tool use not supported" in Anthropic's error reference, checked 2026-11-14).
 */
const NO_FORCED_TOOL_CLAUDE = /^anthropic\/claude-(opus-5\.5|sonnet-5\.5|fable-5|mythos-5)/

export function anthropicSupportsForcedTool(modelId: string): boolean {
    return !NO_FORCED_TOOL_CLAUDE.test(modelId)
}

function systemText(messages: InputMessage[]): string {
    return messages.filter((m) => m.role === "system").map((m) => m.content).filter(Boolean).join("\n\n")
}

/**
 * Builds the input for one forced tool call with low reasoning effort.
 * Workers AI models keep temperature 0.7. Third-party gateway models omit it,
 * because several reasoning models (GPT-6.x, Kimi K3.x) reject a custom temperature.
 */
export function buildModelInput(
    modelId: string,
    messages: InputMessage[],
    tool: ToolSpec,
    reasoningEffort: string | null | undefined,
): Record<string, unknown> {
    const format = apiFormatFor(modelId)
    const workersAi = isWorkersAiModel(modelId)

    if (format === "anthropic") {
        const effort = effortValue(reasoningEffort)
        const forced = anthropicSupportsForcedTool(modelId)
        const system = [
            systemText(messages),
            forced ? "" : `Respond only by calling the ${tool.name} tool exactly once. Do not write the answer as plain text.`,
        ].filter(Boolean).join("\n\n")
        return {
            ...(system ? { system } : {}),
            messages: messages.filter((m) => m.role !== "system"),
            max_tokens: forced ? 8192 : 16000,
            tools: [
                forced
                    ? { name: tool.name, description: tool.description, input_schema: tool.parameters }
                    : {
                        name: tool.name,
                        description: tool.description,
                        input_schema: { ...tool.parameters, additionalProperties: false },
                        strict: true,
                    },
            ],
            // Claude Opus 5.5, Sonnet 5.5, Fable 5.x, and Mythos 5.x return 400 for a forced
            // tool_choice. Anthropic's guidance for them is auto plus strict tool use; the
            // system prompt asks for the tool and completion.ts still parses JSON text as a fallback.
            // Older models keep the forced call, with thinking left off.
            tool_choice: forced ? { type: "tool", name: tool.name } : { type: "auto" },
            ...(effort && effort !== "none" && effort !== "minimal" ? { output_config: { effort } } : {}),
        }
    }

    if (format === "responses") {
        const instructions = systemText(messages)
        const effort = effortValue(reasoningEffort)
        return {
            ...(instructions ? { instructions } : {}),
            input: messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })),
            max_output_tokens: 8192,
            tools: [{ type: "function", name: tool.name, description: tool.description, parameters: tool.parameters }],
            tool_choice: { type: "function", name: tool.name },
            ...(effort ? { reasoning: { effort } } : {}),
        }
    }

    return {
        messages,
        max_tokens: workersAi ? 4096 : 8192,
        ...(workersAi ? { temperature: 0.7 } : {}),
        tools: [openAiTool(tool)],
        tool_choice: forcedToolChoice(tool.name),
        ...reasoningFields(reasoningEffort),
    }
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

    // Anthropic Messages: content: [{ type: "tool_use", input: {...} }]
    if (Array.isArray(record.content)) {
        for (const block of record.content) {
            if (!block || typeof block !== "object") continue
            const item = block as Record<string, unknown>
            if (item.type === "tool_use") {
                const parsed = parseArguments(item.input)
                if (parsed) return parsed
            }
        }
    }

    // OpenAI Responses: output: [{ type: "function_call", arguments: "{...}" }]
    if (Array.isArray(record.output)) {
        for (const entry of record.output) {
            if (!entry || typeof entry !== "object") continue
            const item = entry as Record<string, unknown>
            if (item.type === "function_call") {
                const parsed = parseArguments(item.arguments)
                if (parsed) return parsed
            }
        }
    }

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
    if (typeof record.output_text === "string" && record.output_text) return record.output_text
    if (Array.isArray(record.content)) {
        return record.content.map((block) => {
            if (block && typeof block === "object" && (block as { type?: unknown }).type === "text") {
                return String((block as { text?: unknown }).text ?? "")
            }
            return ""
        }).join("")
    }
    if (Array.isArray(record.output)) {
        const parts: string[] = []
        for (const entry of record.output) {
            if (!entry || typeof entry !== "object") continue
            const content = (entry as { content?: unknown }).content
            if (!Array.isArray(content)) continue
            for (const part of content) {
                if (part && typeof part === "object" && "text" in part) parts.push(String((part as { text: unknown }).text))
            }
        }
        if (parts.length) return parts.join("")
    }
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
