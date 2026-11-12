import { createDailyTopicTask } from "../src/jobs/daily-topic"
import { executeQueuedTask } from "../src/jobs/execute-queued-task"
import { runWithBindings, type TaskQueueMessage } from "../src/utils/bindings"
import { bindingsFromEnv } from "../src/utils/db"

declare module "../.open-next/worker.js" {
    const openNextWorker: {
        fetch: ExportedHandlerFetchHandler<CloudflareEnv>
    }
    export default openNextWorker
}

const worker = {
    async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
        const openNextWorker = await import("../.open-next/worker.js")
        return openNextWorker.default.fetch(request, env, ctx)
    },

    async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
        ctx.waitUntil(runWithBindings(bindingsFromEnv(env), () => createDailyTopicTask().then(() => undefined)))
    },

    async queue(batch: MessageBatch<TaskQueueMessage>, env: CloudflareEnv) {
        for (const message of batch.messages) {
            try {
                await runWithBindings(bindingsFromEnv(env), () => executeQueuedTask(message.body.taskId))
                message.ack()
            } catch (error) {
                console.error("Task execution failed", message.body?.taskId, error)
                message.retry()
            }
        }
    },
}

export default worker
