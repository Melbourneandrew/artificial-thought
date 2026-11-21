import { executeTask } from "@/agent/executor"
import { executeBoardCrosspost } from "@/integrations/public-board"
import { isBoardCrosspostMessage, type TaskQueueMessage } from "@/utils/bindings"
import { getTaskById } from "@/utils/repository/TaskRepo"

export async function executeQueuedTask(message: TaskQueueMessage): Promise<void> {
    if (isBoardCrosspostMessage(message)) {
        await executeBoardCrosspost(message)
        return
    }
    const task = await getTaskById(message.taskId)
    if (!task) {
        throw new Error(`Task ${message.taskId} not found`)
    }
    if (task.completed_at) return
    await executeTask(task)
}
