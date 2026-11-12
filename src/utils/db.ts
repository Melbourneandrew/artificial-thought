import { getBindings, type AppBindings, type TaskQueueMessage } from "@/utils/bindings"
import { readRequestConfig } from "@/utils/request-config"

export type SqlValue = string | number | null

type RuntimeConfig = {
    db: D1Database
    queue?: Queue<TaskQueueMessage>
    ai?: Ai
    llmMode?: string
    gatewayId: string
    accountId?: string
    apiToken?: string
}

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
    const bound = getBindings()
    if (bound) {
        return {
            db: bound.db,
            queue: bound.queue,
            ai: bound.ai,
            llmMode: bound.llmMode || process.env.LLM_MODE,
            gatewayId: bound.gatewayId || process.env.CLOUDFLARE_AI_GATEWAY_ID || "default",
            accountId: bound.accountId || process.env.CLOUDFLARE_ACCOUNT_ID,
            apiToken: bound.apiToken || process.env.CLOUDFLARE_API_TOKEN,
        }
    }

    return readRequestConfig()
}

export async function getDb(): Promise<D1Database> {
    return (await getRuntimeConfig()).db
}

function statement(db: D1Database, sql: string, params: SqlValue[]) {
    const prepared = db.prepare(sql)
    return params.length > 0 ? prepared.bind(...params) : prepared
}

export async function all<T>(sql: string, ...params: SqlValue[]): Promise<T[]> {
    const db = await getDb()
    const result = await statement(db, sql, params).all<T>()
    return result.results ?? []
}

export async function one<T>(sql: string, ...params: SqlValue[]): Promise<T | null> {
    const rows = await all<T>(sql, ...params)
    return rows[0] ?? null
}

export async function run(sql: string, ...params: SqlValue[]): Promise<D1Result> {
    const db = await getDb()
    return statement(db, sql, params).run()
}

export async function enqueueTask(taskId: string): Promise<void> {
    const { queue } = await getRuntimeConfig()
    if (!queue) {
        throw new Error("TASK_QUEUE binding is not configured")
    }
    await queue.send({ taskId })
}

export function bindingsFromEnv(env: CloudflareEnv): AppBindings {
    return {
        db: env.DB,
        queue: env.TASK_QUEUE,
        ai: env.AI,
        llmMode: env.LLM_MODE,
        gatewayId: env.CLOUDFLARE_AI_GATEWAY_ID || "default",
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        apiToken: env.CLOUDFLARE_API_TOKEN,
    }
}
