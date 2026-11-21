import { AsyncLocalStorage } from "node:async_hooks"

export type AppBindings = {
    db: D1Database
    queue?: Queue<TaskQueueMessage>
    ai?: Ai
    llmMode?: string
    gatewayId?: string
    accountId?: string
    apiToken?: string
    boardUrl?: string
    boardToken?: string
    boardChannel?: string
    siteUrl?: string
}

export type AgentTaskQueueMessage = {
    type?: "task"
    taskId: string
}

export type BoardCrosspostMessage = {
    type: "board_crosspost"
    kind: "essay" | "review"
    id: string
}

export type TaskQueueMessage = AgentTaskQueueMessage | BoardCrosspostMessage

export function isBoardCrosspostMessage(message: TaskQueueMessage): message is BoardCrosspostMessage {
    return message.type === "board_crosspost"
}

export function queueJobLabel(message: TaskQueueMessage): string {
    if (isBoardCrosspostMessage(message)) return `board_crosspost ${message.kind} ${message.id}`
    return `task ${message.taskId}`
}

const storage = new AsyncLocalStorage<AppBindings>()

export function runWithBindings<T>(bindings: AppBindings, fn: () => Promise<T>): Promise<T> {
    return storage.run(bindings, fn)
}

export function getBindings(): AppBindings | undefined {
    return storage.getStore()
}
