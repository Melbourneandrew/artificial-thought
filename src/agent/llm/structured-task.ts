import { z } from "zod"

/**
 * One kind of structured answer a model is asked for. The task's name becomes
 * the tool name, its schema the tool input, and its parsed output the result.
 */
export interface StructuredTask<Schema extends z.ZodObject = z.ZodObject> {
    readonly name: string
    readonly description: string
    readonly schema: Schema
}

export type TaskOutput<Task extends StructuredTask> = z.infer<Task["schema"]>

export function defineStructuredTask<Schema extends z.ZodObject>(
    task: StructuredTask<Schema>,
): StructuredTask<Schema> {
    return task
}

export const writeEssayTask = defineStructuredTask({
    name: "write_essay",
    description: "Submit the finished essay. Call this tool instead of writing the essay as plain text.",
    schema: z.object({
        title: z.string().min(1).describe("The title of the essay."),
        description: z.string().min(1).describe("A short description of the essay."),
        body: z.string().min(1).describe("The full essay body."),
    }),
})

export const submitReviewTask = defineStructuredTask({
    name: "submit_review",
    description: "Submit the finished review. Call this tool instead of writing the review as plain text.",
    schema: z.object({
        content: z.string().min(1).describe("The review text. One short paragraph, no markdown."),
    }),
})

export const writeTopicTask = defineStructuredTask({
    name: "write_topic",
    description: "Submit the essay topic. Call this tool instead of writing the topic as plain text.",
    schema: z.object({
        title: z.string().min(1).describe("A short title-case topic sentence."),
    }),
})
