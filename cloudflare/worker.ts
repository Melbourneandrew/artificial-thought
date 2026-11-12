import type { TaskQueueMessage } from "../src/utils/bindings"
import { isCacheablePublicGet, publicCacheKey } from "../src/utils/public-cache"

async function publicCacheVersion(env: CloudflareEnv): Promise<string> {
    try {
        const row = await env.DB.prepare(
            "SELECT value FROM app_meta WHERE key = 'public_cache'",
        ).first<{ value: string }>()
        return row?.value || "0"
    } catch {
        return "0"
    }
}

function withCacheHeader(response: Response, value: string, startedAt: number): Response {
    const headers = new Headers(response.headers)
    headers.set("x-at-cache", value)
    headers.set("server-timing", `cache;dur=${Math.max(0, performance.now() - startedAt).toFixed(1)}`)
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

const worker = {
    async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
        const startedAt = performance.now()
        if (isCacheablePublicGet(request)) {
            const version = await publicCacheVersion(env)
            const cacheKey = publicCacheKey(request, version)
            const hit = await caches.default.match(cacheKey)
            if (hit) return withCacheHeader(hit, "hit", startedAt)
            const { handleFetch } = await import("./handlers")
            return handleFetch(request, env, ctx, cacheKey)
        }
        const { handleFetch } = await import("./handlers")
        return handleFetch(request, env, ctx, null)
    },

    async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
        const { handleScheduled } = await import("./handlers")
        await handleScheduled(env, ctx)
    },

    async queue(batch: MessageBatch<TaskQueueMessage>, env: CloudflareEnv): Promise<void> {
        const { handleQueue } = await import("./handlers")
        await handleQueue(batch, env)
    },
}

export default worker
