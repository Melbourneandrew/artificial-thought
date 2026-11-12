import { AsyncLocalStorage } from "node:async_hooks"

export type AppBindings = {
    db: D1Database
    queue?: Queue<TaskQueueMessage>
    ai?: Ai
    llmMode?: string
    gatewayId?: string
    accountId?: string
    apiToken?: string
}

export type TaskQueueMessage = {
    taskId: string
}

const storage = new AsyncLocalStorage<AppBindings>()

export function runWithBindings<T>(bindings: AppBindings, fn: () => Promise<T>): Promise<T> {
    return storage.run(bindings, fn)
}

export function getBindings(): AppBindings | undefined {
    return storage.getStore()
}
