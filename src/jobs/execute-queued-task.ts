import { executeTask } from "@/agent/executor"
import { getTaskById } from "@/utils/repository/TaskRepo"

export async function executeQueuedTask(taskId: string): Promise<void> {
    const task = await getTaskById(taskId)
    if (!task) {
        throw new Error(`Task ${taskId} not found`)
    }
    if (task.completed_at) return
    await executeTask(task)
}
