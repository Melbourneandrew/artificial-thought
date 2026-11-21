import { APICallError, generateText, RetryError, tool, ToolChoiceViolationError, type LanguageModelUsage, type ToolSet } from "ai"
import { ModelCallError, StructuredOutputError } from "./errors.ts"
import type { ResolvedModel } from "./model-registry.ts"
import type { StructuredTask, TaskOutput } from "./structured-task.ts"

export interface StructuredRequest {
    system?: string
    prompt: string
}

export interface StructuredResult<Output> {
    output: Output
    /** The configured id from `models.model_url`. This is what essays and reviews store. */
    modelId: string
    /** The id the provider reported for the model that answered (debug only, never persisted). */
    servedModelId?: string
    /** Token usage, when the provider reported it (absent for a recovered text reply or mock output). */
    usage?: LanguageModelUsage
}

/**
 * Asks the model for one call of the task's tool and returns its validated input.
 * The tool is forced where the model allows it; models that reject a forced tool
 * (Claude 5.5, Kimi with thinking, Muse Spark) get auto tool choice, and the system
 * prompt asks for the tool either way. If a model still answers in text, a JSON
 * object in that text is accepted. Every result is validated with the task schema.
 */
export async function generateStructured<Task extends StructuredTask>(
    model: ResolvedModel,
    task: Task,
    request: StructuredRequest,
    options: { abortSignal?: AbortSignal } = {},
): Promise<StructuredResult<TaskOutput<Task>>> {
    const { settings } = model
    const tools: ToolSet = {
        [task.name]: tool({
            description: task.description,
            inputSchema: task.schema,
            ...(settings.strictTools ? { strict: true } : {}),
        }),
    }

    let candidate: unknown
    let servedModelId: string | undefined
    let usage: LanguageModelUsage | undefined
    let source: "tool call" | "text reply"
    try {
        const result = await generateText({
            model: model.model,
            system: [request.system, `Respond by calling the ${task.name} tool exactly once.`].filter(Boolean).join("\n\n"),
            prompt: request.prompt,
            tools,
            toolChoice: settings.forceTool ? { type: "tool", toolName: task.name } : "auto",
            maxOutputTokens: settings.maxOutputTokens,
            temperature: settings.temperature,
            reasoning: settings.reasoning,
            abortSignal: options.abortSignal,
        })
        const call = result.toolCalls.find((toolCall) => toolCall.toolName === task.name)
        candidate = call?.input
        servedModelId = result.response.modelId || undefined
        usage = result.totalUsage
        source = "tool call"
    } catch (error) {
        // The model answered without the tool (allowed for models that reject a forced tool).
        // The AI SDK hands back its content so a JSON object written as text can still be used.
        if (!ToolChoiceViolationError.isInstance(error)) throw toModelCallError(model.id, error)
        const text = error.content.map((part) => (part.type === "text" ? part.text : "")).join("")
        candidate = parseJsonObject(text)
        servedModelId = error.modelId || undefined
        source = "text reply"
    }

    const parsed = task.schema.safeParse(candidate)
    if (!parsed.success) {
        throw new StructuredOutputError(
            model.id,
            task.name,
            `${model.id} returned no usable ${task.name} ${source}: ${parsed.error.message}`,
            { cause: parsed.error },
        )
    }
    return { output: parsed.data as TaskOutput<Task>, modelId: model.id, servedModelId, usage }
}

/** Reads the first JSON object in a reply, ignoring a Markdown code fence. */
export function parseJsonObject(text: string): unknown {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start < 0 || end <= start) return undefined
    try {
        return JSON.parse(text.slice(start, end + 1))
    } catch {
        return undefined
    }
}

function toModelCallError(modelId: string, error: unknown): ModelCallError {
    const cause = RetryError.isInstance(error) ? error.lastError : error
    const status = APICallError.isInstance(cause) ? cause.statusCode : undefined
    const detail = cause instanceof Error ? cause.message : String(cause)
    return new ModelCallError(modelId, status, `${modelId} call failed${status ? ` (${status})` : ""}: ${detail}`, { cause: error })
}
