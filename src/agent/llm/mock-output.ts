import type { StructuredTask, TaskOutput } from "./structured-task.ts"

/** Placeholder output for LLM_MODE=mock: every field of the task schema gets sample text. */
export function mockOutput<Task extends StructuredTask>(task: Task): TaskOutput<Task> {
    const fields = Object.keys(task.schema.shape).map((key) => [key, `Mock ${key} for local development.`])
    return task.schema.parse(Object.fromEntries(fields)) as TaskOutput<Task>
}
