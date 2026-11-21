import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModelV4, LanguageModelV4CallOptions } from "@ai-sdk/provider"
import type { AI } from "agents/models/ai-sdk"

/** The columns of a `models` row that decide how it is called. */
export interface ModelRecord {
    model_url: string
    reasoning_effort?: string | null
}

/** The AI SDK's unified reasoning level, which every provider maps to its own field. */
export type ReasoningLevel = NonNullable<LanguageModelV4CallOptions["reasoning"]>

/** How generateStructured asks the model to call the task tool. */
export type ToolChoiceMode = "tool" | "required" | "auto"

/**
 * How a model is reached.
 * - `workers-ai`: an `@cf/` id on Workers AI.
 * - `catalog`: an AI Gateway catalog id; the gateway converts the chat request.
 * - `anthropic` / `openai-responses`: the vendor's own AI SDK model, sent to the
 *   gateway's provider-native endpoint so vendor rules (Claude 5.5 rejecting a
 *   forced tool, GPT-6 tools needing the Responses API) are handled by the vendor package.
 */
export type ModelRoute = "workers-ai" | "catalog" | "anthropic" | "openai-responses"

export interface ModelCallSettings {
    maxOutputTokens: number
    temperature?: number
    reasoning: ReasoningLevel
    /** Send tools with `strict: true` (schema-constrained sampling) where the vendor supports it. */
    strictTools: boolean
    /**
     * How the task tool is requested.
     * - `tool`: force this function by name (default).
     * - `required`: require a tool call, but do not name it. Used when a named
     *   tool_choice is rejected or ignored (Kimi K3 thinking, Qwen).
     * - `auto`: the model may answer in text (Muse Spark only accepts this).
     */
    toolChoice: ToolChoiceMode
}

export interface ResolvedModel {
    /** The id stored in `models.model_url`. */
    id: string
    route: ModelRoute
    model: LanguageModelV4
    settings: ModelCallSettings
}

export const DEFAULT_REASONING: ReasoningLevel = "low"

const REASONING_LEVELS: ReadonlySet<string> = new Set<ReasoningLevel>([
    "none", "minimal", "low", "medium", "high", "xhigh", "max",
])

/**
 * Maps `models.reasoning_effort` to a reasoning level. Empty means the default (`low`),
 * `skip` leaves the provider default (no field sent), and `off` turns reasoning off.
 */
export function reasoningLevel(effort: string | null | undefined): ReasoningLevel {
    const value = (effort ?? "").trim().toLowerCase()
    if (!value) return DEFAULT_REASONING
    if (value === "skip") return "provider-default"
    if (value === "off") return "none"
    return REASONING_LEVELS.has(value) ? value as ReasoningLevel : DEFAULT_REASONING
}

interface RouteRule {
    route: ModelRoute
    matches: (modelId: string) => boolean
    maxOutputTokens: number
    temperature?: number
    strictTools: boolean
    /** Defaults to `"tool"`. */
    toolChoice?: ToolChoiceMode
    build: (ai: AI, modelId: string) => LanguageModelV4
}

/** AI Gateway supplies the vendor credential, so the vendor packages get a placeholder key. */
const GATEWAY_SUPPLIED_KEY = "cloudflare"

/** Catalog ids are `<author>/<model>`; the vendor package wants the vendor's own spelling. */
function vendorModelId(modelId: string): string {
    return modelId.slice(modelId.indexOf("/") + 1)
}

/** Ordered: the first matching rule wins, and the last rule matches every catalog id. */
const ROUTES: readonly RouteRule[] = [
    {
        route: "workers-ai",
        matches: (id) => id.startsWith("@cf/"),
        maxOutputTokens: 4096,
        temperature: 0.7,
        strictTools: false,
        build: (ai, id) => ai.languageModel(id),
    },
    {
        route: "anthropic",
        matches: (id) => id.startsWith("anthropic/"),
        // Claude 5.5 thinks before answering and thinking counts against this limit.
        maxOutputTokens: 16000,
        strictTools: true,
        // Anthropic spells versions with dashes: anthropic/claude-opus-5.5 -> claude-opus-5-5.
        build: (ai, id) => ai(createAnthropic({ apiKey: GATEWAY_SUPPLIED_KEY })(vendorModelId(id).replaceAll(".", "-"))),
    },
    {
        route: "openai-responses",
        matches: (id) => /^openai\/gpt-(6|5\.6)/.test(id),
        maxOutputTokens: 8192,
        strictTools: true,
        build: (ai, id) => ai(createOpenAI({ apiKey: GATEWAY_SUPPLIED_KEY }).responses(vendorModelId(id))),
    },
    {
        route: "catalog",
        // Kimi K3 always thinks and rejects a *named* tool_choice, but accepts "required".
        matches: (id) => id.startsWith("moonshotai/kimi-"),
        maxOutputTokens: 8192,
        strictTools: false,
        toolChoice: "required",
        build: (ai, id) => ai.languageModel(id),
    },
    {
        route: "catalog",
        // Qwen often ignores a named tool_choice and writes prose; "required" coerces a call.
        matches: (id) => id.startsWith("alibaba/qwen"),
        maxOutputTokens: 8192,
        strictTools: false,
        toolChoice: "required",
        build: (ai, id) => ai.languageModel(id),
    },
    {
        route: "catalog",
        // Muse Spark rejects every tool_choice except "auto".
        matches: (id) => id.startsWith("meta/muse-spark-"),
        maxOutputTokens: 8192,
        strictTools: false,
        toolChoice: "auto",
        build: (ai, id) => ai.languageModel(id),
    },
    {
        route: "catalog",
        matches: (id) => id.includes("/"),
        maxOutputTokens: 8192,
        strictTools: false,
        build: (ai, id) => ai.languageModel(id),
    },
]

/** Maps a `models` row to an AI SDK model and its call settings. */
export function resolveModel(record: ModelRecord, ai: AI): ResolvedModel {
    const id = record.model_url.trim()
    const rule = ROUTES.find((candidate) => candidate.matches(id))
    if (!rule) {
        throw new TypeError(`Unsupported model id "${id}". Use an @cf/ Workers AI id or an AI Gateway catalog id like anthropic/claude-opus-5.5.`)
    }
    return {
        id,
        route: rule.route,
        model: rule.build(ai, id),
        settings: {
            maxOutputTokens: rule.maxOutputTokens,
            temperature: rule.temperature,
            reasoning: reasoningLevel(record.reasoning_effort),
            strictTools: rule.strictTools,
            toolChoice: rule.toolChoice ?? "tool",
        },
    }
}
