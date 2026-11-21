export class BoardApiError extends Error {
    readonly status: number
    readonly body: string

    constructor(status: number, body: string, method: string, path: string) {
        super(`Board API ${method} ${path} failed with ${status}: ${body}`)
        this.name = "BoardApiError"
        this.status = status
        this.body = body
    }

    get retryable(): boolean {
        return this.status >= 500 || this.status === 429 || this.status === 408
    }
}

export type BoardMessage = {
    id: string
    text?: string
}

export type PublicBoardApi = {
    post(channel: string, text: string, clientId: string): Promise<BoardMessage>
    reply(parentId: string, text: string, clientId: string): Promise<BoardMessage>
    edit(messageId: string, text: string): Promise<void>
    delete(messageId: string): Promise<void>
}

type BoardClientOptions = {
    url: string
    token: string
    fetch?: typeof fetch
}

type JsonMap = Record<string, unknown>

export function createBoardClient(options: BoardClientOptions): PublicBoardApi {
    const base = options.url.replace(/\/$/, "")
    const token = options.token
    const fetchFn = options.fetch ?? fetch

    async function request(method: string, path: string, body?: JsonMap): Promise<unknown> {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
        if (body !== undefined) headers["Content-Type"] = "application/json"
        const response = await fetchFn(`${base}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        })
        const raw = await response.text()
        let parsed: unknown = null
        if (raw) {
            try {
                parsed = JSON.parse(raw) as unknown
            } catch {
                parsed = raw
            }
        }
        if (!response.ok) {
            const excerpt = typeof parsed === "string" ? parsed : raw
            throw new BoardApiError(response.status, excerpt.slice(0, 500), method, path)
        }
        return parsed
    }

    function postedMessage(parsed: unknown, path: string, method: string): BoardMessage {
        const message = (parsed as { message?: { id?: unknown; text?: unknown } } | null)?.message
        if (!message || typeof message.id !== "string" || message.id.length === 0) {
            throw new BoardApiError(500, "response did not include message.id", method, path)
        }
        return { id: message.id, text: typeof message.text === "string" ? message.text : undefined }
    }

    return {
        async post(channel, text, clientId) {
            const path = "/messages"
            const parsed = await request("POST", path, { channel, text, id: clientId })
            return postedMessage(parsed, path, "POST")
        },
        async reply(parentId, text, clientId) {
            const path = "/messages"
            const parsed = await request("POST", path, { re: parentId, text, id: clientId })
            return postedMessage(parsed, path, "POST")
        },
        async edit(messageId, text) {
            await request("POST", `/messages/${encodeURIComponent(messageId)}/edit`, { text })
        },
        async delete(messageId) {
            await request("POST", `/messages/${encodeURIComponent(messageId)}/delete`, {})
        },
    }
}
