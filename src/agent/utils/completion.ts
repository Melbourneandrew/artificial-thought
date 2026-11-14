import { z } from "zod"
import { getRuntimeConfig } from "@/utils/db"
import {
    apiFormatFor,
    buildModelInput,
    extractMessageText,
    extractToolArguments,
    parseJsonObject,
    restPathFor,
    type ToolSpec,
} from "@/agent/utils/model-call"

export type ChatMessage = {
    role: "system" | "user" | "assistant"
    content: string
}

type StructuredCompletion<T> = {
    model: string
    completion: T
}

type GatewayRunner = {
    run: (
        model: string,
        input: Record<string, unknown>,
        options?: { gateway?: { id: string } },
    ) => Promise<unknown>
}

function schemaRecord(schema: z.ZodType): { type?: string; entries?: Record<string, string> } {
    return (schema as { def?: { type?: string; entries?: Record<string, string> } }).def ?? {}
}

export function generateDummyData(schema: z.ZodType): unknown {
    const def = schemaRecord(schema)
    if (def.type === "string") return "Mock response for local development."
    if (def.type === "number") return 1
    if (def.type === "boolean") return true
    if (def.type === "array") {
        const element = (schema as { element?: z.ZodType }).element
        return element ? [generateDummyData(element)] : []
    }
    if (def.type === "object") {
        const shape = (schema as { shape?: Record<string, z.ZodType> }).shape ?? {}
        const dummy: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(shape)) {
            dummy[key] = generateDummyData(value)
        }
        return dummy
    }
    if (def.type === "enum" && def.entries) {
        return Object.values(def.entries)[0]
    }
    if (def.type === "literal") {
        return (schema as { value?: unknown }).value
    }
    return "Mock response for local development."
}

async function callGateway(
    modelId: string,
    messages: ChatMessage[],
    tool: ToolSpec,
    reasoningEffort: string | null | undefined,
): Promise<{ model: string; payload: unknown }> {
    const config = await getRuntimeConfig()
    const gatewayId = config.gatewayId || "default"
    const input = buildModelInput(modelId, messages, tool, reasoningEffort)

    if (config.ai) {
        const ai = config.ai as unknown as GatewayRunner
        const payload = await ai.run(modelId, input, { gateway: { id: gatewayId } })
        const record = payload && typeof payload === "object" ? payload as { model?: string } : {}
        return { model: record.model || modelId, payload }
    }

    if (!config.apiToken || !config.accountId) {
        throw new Error("Cloudflare AI is not configured. Set LLM_MODE=mock for local development, or set the AI binding plus CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.")
    }

    const path = restPathFor(apiFormatFor(modelId))
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.accountId}/${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
            "cf-aig-gateway-id": gatewayId,
        },
        body: JSON.stringify({ model: modelId, ...input }),
    })
    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Cloudflare AI request failed (${response.status}): ${body.slice(0, 500)}`)
    }
    const payload = await response.json()
    const record = payload as { model?: string }
    return { model: record.model || modelId, payload }
}

export async function getStructuredCompletion<T extends z.ZodType>(
    messages: ChatMessage[],
    schema: T,
    modelId: string,
    tool: ToolSpec,
    reasoningEffort?: string | null,
): Promise<StructuredCompletion<z.infer<T>>> {
    if (process.env.LLM_MODE === "mock" || process.env.TASK_TESTING_MODE === "true") {
        return {
            model: modelId,
            completion: schema.parse(generateDummyData(schema)),
        }
    }

    const config = await getRuntimeConfig()
    if (config.llmMode === "mock") {
        return {
            model: modelId,
            completion: schema.parse(generateDummyData(schema)),
        }
    }

    const { model, payload } = await callGateway(modelId, messages, tool, reasoningEffort)
    const toolArguments = extractToolArguments(payload)
    if (toolArguments) {
        return { model, completion: schema.parse(toolArguments) }
    }

    const text = extractMessageText(payload)
    console.error(
        `Model ${modelId} did not call ${tool.name}. Falling back to JSON in the message text.`,
        text.slice(0, 1000),
    )
    if (!text) {
        throw new Error(`Model ${modelId} returned no ${tool.name} tool call and no message text`)
    }
    try {
        return { model, completion: schema.parse(parseJsonObject(text)) }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Model ${modelId} fallback for ${tool.name} failed validation: ${message}`)
        throw new Error(`Model ${modelId} returned no usable ${tool.name} tool call`)
    }
}
