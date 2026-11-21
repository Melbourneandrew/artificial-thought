import { APICallError, generateText, RetryError, tool, ToolChoiceViolationError, type LanguageModelUsage, type ToolSet } from "ai"
import { ModelCallError, StructuredOutputError } from "./errors.ts"
import type { ResolvedModel } from "./model-registry.ts"
import { parseJsonObject } from "./parse-json.ts"
import { recoverFromText } from "./recover-output.ts"
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
 *
 * `toolChoice` is `"tool"` (named) where the vendor allows it, `"required"` when a
 * named choice is rejected but a generic required call works (Kimi K3, Qwen), and
 * `"auto"` when the model only accepts auto (Muse Spark). The system prompt asks
 * for the tool either way. If the model still answers in text, a JSON object in
 * that text is accepted; if there is no JSON, a substantive plain-text review or
 * essay is accepted once. There is no retry loop.
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
            toolChoice: toolChoiceFor(settings.toolChoice, task.name),
            maxOutputTokens: settings.maxOutputTokens,
            temperature: settings.temperature,
            reasoning: settings.reasoning,
            abortSignal: options.abortSignal,
        })
        const call = result.toolCalls.find((toolCall) => toolCall.toolName === task.name)
        servedModelId = result.response.modelId || undefined
        usage = result.totalUsage
        const fromTool = task.schema.safeParse(call?.input)
        if (fromTool.success) {
            candidate = fromTool.data
            source = "tool call"
        } else {
            candidate = recoverFromText(task, result.text ?? "")
            source = "text reply"
        }
    } catch (error) {
        // Forced or required tool choice: the SDK throws when the model answers in text.
        // Recover JSON or usable prose from that text instead of calling the model again.
        if (!ToolChoiceViolationError.isInstance(error)) throw toModelCallError(model.id, error)
        const text = error.content.map((part) => (part.type === "text" ? part.text : "")).join("")
        candidate = recoverFromText(task, text)
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

export { parseJsonObject }

function toolChoiceFor(mode: ResolvedModel["settings"]["toolChoice"], toolName: string) {
    if (mode === "required") return "required" as const
    if (mode === "auto") return "auto" as const
    return { type: "tool" as const, toolName }
}

function toModelCallError(modelId: string, error: unknown): ModelCallError {
    const cause = RetryError.isInstance(error) ? error.lastError : error
    const status = APICallError.isInstance(cause) ? cause.statusCode : undefined
    const detail = cause instanceof Error ? cause.message : String(cause)
    return new ModelCallError(modelId, status, `${modelId} call failed${status ? ` (${status})` : ""}: ${detail}`, { cause: error })
}
