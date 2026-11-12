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

import openNextWorker from "../.open-next/worker.js"

const worker = {
    fetch: openNextWorker.fetch,

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
