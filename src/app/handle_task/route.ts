import { getTaskById } from "@/utils/repository/TaskRepo"
import { executeTask } from "@/agent/executor"

export async function POST(request: Request) {
    const payload = await request.json()

    const task = await getTaskById(payload.id)
    if (!task) {
        console.error("Task not found", payload)
        return new Response("Task not found", { status: 404 })
    }

    console.log("Handling task: ", task.prompt);
    executeTask(task);
    return new Response("OK")
}