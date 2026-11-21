import { createDailyTopicTask } from "../src/jobs/daily-topic"
import { executeQueuedTask } from "../src/jobs/execute-queued-task"
import { isCacheablePublicGet, publicCacheKey } from "../src/utils/public-cache"
import { queueJobLabel, runWithBindings, type TaskQueueMessage } from "../src/utils/bindings"
import { bindingsFromEnv } from "../src/utils/db"

declare module "../.open-next/worker.js" {
    const openNextWorker: {
        fetch: ExportedHandlerFetchHandler<CloudflareEnv>
    }
    export default openNextWorker
}

export async function handleFetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext,
    cacheKey: Request | null,
): Promise<Response> {
    const openNextWorker = await import("../.open-next/worker.js")
    const response = await openNextWorker.default.fetch(request, env, ctx)
    if (!cacheKey || !response.ok || !response.headers.get("content-type")?.includes("text/html")) {
        return response
    }
    const headers = new Headers(response.headers)
    headers.delete("set-cookie")
    headers.set("cache-control", "public, max-age=86400, s-maxage=86400")
    headers.set("x-at-cache", "miss")
    const body = await response.arrayBuffer()
    const cached = new Response(body, { status: response.status, headers })
    ctx.waitUntil(caches.default.put(cacheKey, cached.clone()))
    return cached
}

export async function handleScheduled(env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runWithBindings(bindingsFromEnv(env), () => createDailyTopicTask().then(() => undefined)))
}

export async function handleQueue(batch: MessageBatch<TaskQueueMessage>, env: CloudflareEnv): Promise<void> {
    for (const message of batch.messages) {
        try {
            await runWithBindings(bindingsFromEnv(env), () => executeQueuedTask(message.body))
            message.ack()
        } catch (error) {
            console.error("Queue job failed", message.body ? queueJobLabel(message.body) : "unknown", error)
            message.retry()
        }
    }
}

export function cacheKeyForPublicGet(request: Request, version: string): Request | null {
    if (!isCacheablePublicGet(request)) return null
    return publicCacheKey(request, version)
}
