import { createWriteTopicTask } from "@/utils/repository/TaskRepo"
import { one } from "@/utils/db"
import { Author } from "@/types"

export async function createDailyTopicTask(): Promise<string | null> {
    const author = await one<{ id: string }>(`SELECT id FROM authors ORDER BY RANDOM() LIMIT 1`)
    if (!author) {
        console.error("No authors available for the daily topic task")
        return null
    }
    const task = await createWriteTopicTask({ id: author.id } as Author, null)
    return task.id
}
