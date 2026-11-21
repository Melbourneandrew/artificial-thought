import { getRuntimeConfig } from "@/utils/db"
import type { BoardCrosspostMessage } from "@/utils/bindings"

export async function enqueueBoardCrosspost(kind: "essay" | "review", id: string): Promise<void> {
    const { queue } = await getRuntimeConfig()
    if (!queue) {
        console.error("public-board: TASK_QUEUE is not configured; skipped", kind, id)
        return
    }
    const message: BoardCrosspostMessage = { type: "board_crosspost", kind, id }
    await queue.send(message)
}

export async function tryEnqueueBoardCrosspost(kind: "essay" | "review", id: string): Promise<void> {
    try {
        await enqueueBoardCrosspost(kind, id)
    } catch (error) {
        console.error("public-board: failed to enqueue", kind, id, error)
    }
}
