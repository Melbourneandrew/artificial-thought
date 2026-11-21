import type { StructuredTask, TaskOutput } from "./structured-task.ts"
import { parseJsonObject } from "./parse-json.ts"

const MIN_REVIEW_CHARS = 80
const MIN_ESSAY_BODY_CHARS = 400

/** Turns a text reply into task output: JSON, an embedded tool call, or sensible plain text. */
export function recoverFromText<Task extends StructuredTask>(task: Task, text: string): TaskOutput<Task> | undefined {
    const json = unwrapToolEnvelope(parseJsonObject(text), task.name)
    const fromJson = task.schema.safeParse(json)
    if (fromJson.success) return fromJson.data as TaskOutput<Task>
    const fromPlain = recoverPlainText(task, text)
    const parsed = task.schema.safeParse(fromPlain)
    return parsed.success ? parsed.data as TaskOutput<Task> : undefined
}

/** If the model wrapped the arguments in `{ name, arguments }`, return the arguments. */
export function unwrapToolEnvelope(value: unknown, toolName: string): unknown {
    if (!isRecord(value)) return value
    const name = value.name
    if (name !== toolName) return value
    if (isRecord(value.arguments)) return value.arguments
    if (typeof value.arguments === "string") return parseJsonObject(value.arguments) ?? value
    if (isRecord(value.parameters)) return value.parameters
    return value
}

function recoverPlainText(task: StructuredTask, text: string): unknown {
    const cleaned = normalizePlainText(text)
    if (task.name === "submit_review") {
        if (cleaned.length < MIN_REVIEW_CHARS) return undefined
        return { content: cleaned }
    }
    if (task.name === "write_essay") return deriveEssay(cleaned)
    return undefined
}

/** Pull a title, description, and body out of a finished essay written as prose. */
export function deriveEssay(text: string): { title: string, description: string, body: string } | undefined {
    const cleaned = normalizePlainText(text)
    if (cleaned.length < MIN_ESSAY_BODY_CHARS) return undefined

    const heading = cleaned.match(/^#{1,3}\s+(.+)$/m)
    let title: string
    let body: string
    if (heading && heading.index !== undefined) {
        title = heading[1].trim()
        body = `${cleaned.slice(0, heading.index)}${cleaned.slice(heading.index + heading[0].length)}`.trim()
    } else {
        const firstLine = cleaned.split(/\n/, 1)[0].trim()
        const rest = cleaned.slice(firstLine.length).trim()
        if (firstLine.length >= 8 && firstLine.length <= 120 && !/[.!?]$/.test(firstLine) && rest.length >= MIN_ESSAY_BODY_CHARS) {
            title = firstLine.replace(/^["']|["']$/g, "")
            body = rest
        } else {
            title = titleFromBody(cleaned)
            body = cleaned
        }
    }
    if (title.length < 1 || body.length < MIN_ESSAY_BODY_CHARS) return undefined
    return { title, description: describe(body), body }
}

function titleFromBody(body: string): string {
    const sentence = body.match(/\S(?:[^.!?\n]{6,99})(?:[.!?]|$)/)
    const raw = (sentence?.[0] ?? body.slice(0, 80)).trim()
    return raw.replace(/[.!?]+\s*$/, "").trim()
}

function describe(body: string): string {
    const paragraph = body.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() ?? body
    if (paragraph.length <= 200) return paragraph
    const cut = paragraph.slice(0, 200)
    const at = cut.lastIndexOf(" ")
    return `${(at > 80 ? cut.slice(0, at) : cut).trim()}…`
}

/** Strips Markdown fences and trims without otherwise rewriting the author's words. */
export function normalizePlainText(text: string): string {
    let value = text.trim()
    const fenced = value.match(/^```(?:\w+)?\s*\n([\s\S]*?)\n```$/)
    if (fenced) value = fenced[1].trim()
    return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value)
}
