import { z } from "zod"
import { getRuntimeConfig } from "@/utils/db"

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

function schemaHint(schema: z.ZodType): string {
    return `Respond with one JSON object and no markdown. Match this shape exactly:\n${JSON.stringify(generateDummyData(schema), null, 2)}`
}

export function extractModelText(payload: unknown): string {
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

async function callGateway(modelId: string, messages: ChatMessage[]): Promise<{ model: string; text: string }> {
    const config = await getRuntimeConfig()
    const gatewayId = config.gatewayId || "default"

    if (config.ai) {
        const ai = config.ai as unknown as GatewayRunner
        const payload = await ai.run(modelId, {
            messages,
            max_tokens: 4096,
            temperature: 0.7,
        }, {
            gateway: { id: gatewayId },
        })
        const record = payload && typeof payload === "object" ? payload as { model?: string } : {}
        return {
            model: record.model || modelId,
            text: extractModelText(payload),
        }
    }

    if (!config.apiToken || !config.accountId) {
        throw new Error("Cloudflare AI is not configured. Set LLM_MODE=mock for local development, or set the AI binding plus CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.")
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/v1/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
            "cf-aig-gateway-id": gatewayId,
        },
        body: JSON.stringify({
            model: modelId,
            messages,
            max_tokens: 4096,
            temperature: 0.7,
        }),
    })
    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Cloudflare AI request failed (${response.status}): ${body.slice(0, 500)}`)
    }
    const payload = await response.json()
    const record = payload as { model?: string }
    return {
        model: record.model || modelId,
        text: extractModelText(payload),
    }
}

export async function getStructuredCompletion<T extends z.ZodType>(
    messages: ChatMessage[],
    schema: T,
    modelId: string,
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

    const guided: ChatMessage[] = [
        { role: "system", content: schemaHint(schema) },
        ...messages,
    ]
    const { model, text } = await callGateway(modelId, guided)
    if (!text) {
        throw new Error(`Model ${modelId} returned an empty response`)
    }
    const parsed = parseJsonObject(text)
    return {
        model,
        completion: schema.parse(parsed),
    }
}
