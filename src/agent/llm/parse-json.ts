/** Reads the first JSON object in a reply, ignoring a Markdown code fence. */
export function parseJsonObject(text: string): unknown {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start < 0 || end <= start) return undefined
    try {
        return JSON.parse(text.slice(start, end + 1))
    } catch {
        return undefined
    }
}
