import { assertSchedulableAuthor } from "@/utils/repository/AuthorRepo"
import { all, enqueueTask, one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"
import { Author, Essay, Task, Topic } from "@/types"
import { AuthorRow, authorSelect, mapAuthor } from "@/utils/repository/rows"

type TaskRow = {
    id: string
    prompt: string
    author_id: string
    topic_id: string | null
    essay_id: string | null
    review_id: string | null
    parent_task_id: string | null
    created_at: string
    completed_at: string | null
}

function mapTask(row: TaskRow, extras: Partial<Task> = {}): Task {
    return {
        id: row.id,
        prompt: row.prompt,
        author_id: row.author_id,
        topic_id: row.topic_id,
        essay_id: row.essay_id,
        review_id: row.review_id,
        parent_task_id: row.parent_task_id,
        created_at: row.created_at,
        completed_at: row.completed_at,
        ...extras,
    }
}

async function insertTask(values: {
    prompt: string
    author_id: string
    topic_id?: string | null
    essay_id?: string | null
    review_id?: string | null
    parent_task_id?: string | null
}): Promise<Task> {
    const task: TaskRow = {
        id: newId(),
        prompt: values.prompt,
        author_id: values.author_id,
        topic_id: values.topic_id ?? null,
        essay_id: values.essay_id ?? null,
        review_id: values.review_id ?? null,
        parent_task_id: values.parent_task_id ?? null,
        created_at: nowIso(),
        completed_at: null,
    }
    await run(
        `INSERT INTO tasks (id, prompt, author_id, topic_id, essay_id, review_id, parent_task_id, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        task.id,
        task.prompt,
        task.author_id,
        task.topic_id,
        task.essay_id,
        task.review_id,
        task.parent_task_id,
        task.created_at,
    )
    await enqueueTask(task.id)
    return mapTask(task)
}

export async function createWriteEssayTask(author: Author, topic: Topic, parent: Task): Promise<Task> {
    await assertSchedulableAuthor(author.id)
    return insertTask({
        prompt: "write_essay",
        author_id: author.id,
        topic_id: topic.id,
        parent_task_id: parent.id,
    })
}

export async function createWriteReviewTask(author: Author, essay: Essay, parent: Task): Promise<Task> {
    await assertSchedulableAuthor(author.id)
    return insertTask({
        prompt: "write_review",
        author_id: author.id,
        essay_id: essay.id,
        parent_task_id: parent.id,
    })
}

export async function createWriteTopicTask(author: Author, parent: Task | null = null): Promise<Task> {
    await assertSchedulableAuthor(author.id)
    return insertTask({
        prompt: "write_topic",
        author_id: author.id,
        parent_task_id: parent?.id ?? null,
    })
}

export async function createTask(params: Omit<Task, "id" | "created_at" | "completed_at">): Promise<Task> {
    await assertSchedulableAuthor(params.author_id)
    return insertTask(params)
}

export async function getTaskById(taskId: string): Promise<Task | null> {
    const row = await one<TaskRow>(`SELECT * FROM tasks WHERE id = ?`, taskId)
    if (!row) return null

    const authorRow = await one<AuthorRow>(
        `SELECT ${authorSelect}
         FROM authors a
         LEFT JOIN models m ON m.id = a.model_id
         LEFT JOIN prompts p ON p.prompt_key = a.system_prompt_key
         WHERE a.id = ?`,
        row.author_id,
    )
    const topic = row.topic_id
        ? await one<Topic>(`SELECT id, title, slug, published_at, created_at FROM topics WHERE id = ?`, row.topic_id)
        : null
    const essay = row.essay_id
        ? await one<Essay>(`SELECT id, title, description, content, topic_id, author_id, model_name, created_at FROM essays WHERE id = ?`, row.essay_id)
        : null
    const review = row.review_id
        ? await one<{ id: string; content: string; created_at: string; essay_id: string; author_id: string }>(
            `SELECT id, content, created_at, essay_id, author_id FROM reviews WHERE id = ?`,
            row.review_id,
        )
        : null
    const parent = row.parent_task_id
        ? await one<Task>(`SELECT id, prompt, created_at, author_id, topic_id, essay_id, review_id, parent_task_id, completed_at FROM tasks WHERE id = ?`, row.parent_task_id)
        : null

    return mapTask(row, {
        author: authorRow ? mapAuthor(authorRow) : undefined,
        topic: topic ?? undefined,
        essay: essay ? { ...essay, author: authorRow ? mapAuthor(authorRow) : undefined as unknown as Author, topic: topic ?? undefined as unknown as Topic } : undefined,
        review: review ? { ...review, essay: essay as Essay } : undefined,
        parent_task: parent ?? undefined,
    })
}

export async function completeTask(taskId: string): Promise<Task> {
    const completedAt = nowIso()
    await run(`UPDATE tasks SET completed_at = ? WHERE id = ?`, completedAt, taskId)
    const task = await one<TaskRow>(`SELECT * FROM tasks WHERE id = ?`, taskId)
    if (!task) throw new Error("Failed to complete task")
    return mapTask(task)
}

export async function getPendingTasksForAuthor(authorId: string): Promise<Task[]> {
    const rows = await all<TaskRow>(
        `SELECT * FROM tasks WHERE author_id = ? AND completed_at IS NULL ORDER BY created_at ASC`,
        authorId,
    )
    return rows.map((row) => mapTask(row))
}

export async function getRootTasks(): Promise<Task[]> {
    const rows = await all<TaskRow>(
        `SELECT * FROM tasks WHERE parent_task_id IS NULL ORDER BY created_at DESC`,
    )
    return rows.map((row) => mapTask(row))
}

export async function createTaskLog(taskId: string, content: string): Promise<void> {
    await run(
        `INSERT INTO task_logs (id, task_id, created_at, content) VALUES (?, ?, ?, ?)`,
        newId(),
        taskId,
        nowIso(),
        content,
    )
}

export interface TaskLog {
    id: string
    content: string
    created_at: string
    task_id: string
}

export async function getTaskLogs(taskId: string): Promise<TaskLog[]> {
    return all<TaskLog>(
        `SELECT id, content, created_at, task_id FROM task_logs WHERE task_id = ? ORDER BY created_at ASC`,
        taskId,
    )
}

export interface TaskTreeItem extends Task {
    level: number
    logs: Array<{
        id: string
        content: string
        created_at: string
    }>
}

export async function getTaskTreeWithLogs(rootTaskId: string): Promise<TaskTreeItem[]> {
    const tasks = await all<TaskRow & { level: number }>(
        `WITH RECURSIVE task_tree AS (
            SELECT id, prompt, author_id, topic_id, essay_id, review_id, parent_task_id, created_at, completed_at, 0 AS level
            FROM tasks
            WHERE id = ?
            UNION ALL
            SELECT t.id, t.prompt, t.author_id, t.topic_id, t.essay_id, t.review_id, t.parent_task_id, t.created_at, t.completed_at, tt.level + 1
            FROM tasks t
            INNER JOIN task_tree tt ON t.parent_task_id = tt.id
         )
         SELECT * FROM task_tree ORDER BY level, created_at`,
        rootTaskId,
    )
    if (tasks.length === 0) return []

    const placeholders = tasks.map(() => "?").join(", ")
    const logs = await all<TaskLog>(
        `SELECT id, content, created_at, task_id FROM task_logs
         WHERE task_id IN (${placeholders})
         ORDER BY created_at ASC`,
        ...tasks.map((task) => task.id),
    )
    const logsByTask = new Map<string, TaskLog[]>()
    for (const log of logs) {
        const list = logsByTask.get(log.task_id) ?? []
        list.push(log)
        logsByTask.set(log.task_id, list)
    }
    return tasks.map((task) => ({
        ...mapTask(task),
        level: Number(task.level),
        logs: (logsByTask.get(task.id) ?? []).map((log) => ({
            id: log.id,
            content: log.content,
            created_at: log.created_at,
        })),
    }))
}
