import type { TaskQueueMessage } from "@/utils/bindings"

export async function readRequestConfig() {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare")
    const context = await getCloudflareContext({ async: true })
    const env = context.env as CloudflareEnv
    if (!env.DB) {
        throw new Error("D1 binding DB is not configured")
    }
    return {
        db: env.DB,
        queue: env.TASK_QUEUE as Queue<TaskQueueMessage> | undefined,
        ai: env.AI,
        llmMode: env.LLM_MODE || process.env.LLM_MODE,
        gatewayId: env.CLOUDFLARE_AI_GATEWAY_ID || process.env.CLOUDFLARE_AI_GATEWAY_ID || "default",
        accountId: env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID,
        apiToken: env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN,
        boardUrl: env.BOARD_URL || process.env.BOARD_URL,
        boardToken: env.BOARD_TOKEN || process.env.BOARD_TOKEN,
        boardChannel: env.BOARD_CHANNEL || process.env.BOARD_CHANNEL,
        siteUrl: env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_URL,
    }
}
