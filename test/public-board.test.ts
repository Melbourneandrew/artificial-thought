import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { DatabaseSync } from "node:sqlite"
import { BoardApiError, createBoardClient } from "../src/integrations/public-board/client.ts"
import {
    canonicalEssayUrl,
    essayClientId,
    reviewClientId,
    topicIsPublished,
} from "../src/integrations/public-board/ids.ts"
import { excerpt, formatEssayPost, formatReviewReply } from "../src/integrations/public-board/format.ts"
import { isBoardCrosspostMessage, queueJobLabel, type TaskQueueMessage } from "../src/utils/bindings.ts"

function openMigrated() {
    const db = new DatabaseSync(":memory:")
    db.exec("PRAGMA foreign_keys = ON")
    for (const name of [
        "0001_init.sql",
        "0002_catalog.sql",
        "0003_reasoning.sql",
        "0004_public_cache.sql",
        "0005_author_status.sql",
        "0006_author_lineage.sql",
        "0007_latest_models.sql",
        "0008_claude_opus.sql",
        "0009_qwen_glm.sql",
        "0010_board_crossposts.sql",
    ]) {
        db.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8"))
    }
    return db
}

test("excerpt stays within about 400 characters and breaks on a word", () => {
    const short = "A brief civic argument."
    assert.equal(excerpt(short), short)
    const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ")
    const cut = excerpt(long, 400)
    assert.ok(cut.endsWith("…"))
    assert.ok(cut.length <= 401)
    assert.doesNotMatch(cut, /word79/)
    assert.equal(excerpt("  spaced\n\nlines  "), "spaced lines")
})

test("essay posts include title, author, model, excerpt, and the canonical link", () => {
    const url = canonicalEssayUrl("33333333-3333-4333-8333-333333333333")
    assert.equal(url, "https://artificial-thought.com/essays/33333333-3333-4333-8333-333333333333")
    const text = formatEssayPost({
        title: "The Forecast in the Streets",
        topicTitle: "Can a City Learn From Its Own Weather?",
        authorName: "Claude",
        modelName: "anthropic/claude-opus-5.5",
        content: "A city that keeps its weather is a city that can argue with its own past. " + "More. ".repeat(200),
        description: "ignored when content exists",
        url,
    })
    assert.match(text, /^# The Forecast in the Streets/m)
    assert.match(text, /\*\*Claude\*\* · `anthropic\/claude-opus-5.5`/)
    assert.match(text, /Topic: Can a City Learn From Its Own Weather\?/)
    assert.match(text, /https:\/\/artificial-thought\.com\/essays\/33333333-3333-4333-8333-333333333333/)
    assert.ok(!text.includes("ignored when content exists"))
    const body = text.split("\n\n")[2]
    assert.ok(body.endsWith("…"))
    assert.ok(body.length <= 401)
})

test("review replies name the reviewer and omit a score when there isn't one", () => {
    const withScore = formatReviewReply({
        reviewerName: "Grok",
        modelName: "xai/grok-4.7",
        content: "The storm record is doing more work than a chart usually does.",
        score: 8,
    })
    assert.match(withScore, /\*\*Grok\*\* · `xai\/grok-4.7`/)
    assert.match(withScore, /Score: 8/)
    const without = formatReviewReply({
        reviewerName: "Grok",
        modelName: "xai/grok-4.7",
        content: "The storm record is doing more work than a chart usually does.",
    })
    assert.doesNotMatch(without, /Score:/)
})

test("board client posts, replies, and deletes over the HTTP API the CLI uses", async () => {
    const calls: { method: string; url: string; headers: Record<string, string>; body: unknown }[] = []
    const api = createBoardClient({
        url: "https://the-public-board.vercel.app/api/board",
        token: "test-token",
        fetch: async (input, init) => {
            const url = String(input)
            const headers = Object.fromEntries(new Headers(init?.headers).entries())
            const body = init?.body ? JSON.parse(String(init.body)) : null
            calls.push({ method: String(init?.method), url, headers, body })
            if (url.endsWith("/messages") && body?.channel) {
                return new Response(JSON.stringify({ message: { id: "msg_root" } }), { status: 201 })
            }
            if (url.endsWith("/messages") && body?.re) {
                return new Response(JSON.stringify({ message: { id: "msg_reply" } }), { status: 201 })
            }
            if (url.endsWith("/edit") || url.endsWith("/delete")) {
                return new Response(JSON.stringify({ ok: true }), { status: 200 })
            }
            return new Response("nope", { status: 500 })
        },
    })

    const posted = await api.post("artificial-thought", "hello", "at-essay-1")
    assert.equal(posted.id, "msg_root")
    const reply = await api.reply("msg_root", "review", "at-review-1")
    assert.equal(reply.id, "msg_reply")
    await api.edit("msg_root", "updated")
    await api.delete("msg_slash/id")

    assert.equal(calls[0].url, "https://the-public-board.vercel.app/api/board/messages")
    assert.equal(calls[0].headers.authorization, "Bearer test-token")
    assert.deepEqual(calls[0].body, { channel: "artificial-thought", text: "hello", id: "at-essay-1" })
    assert.deepEqual(calls[1].body, { re: "msg_root", text: "review", id: "at-review-1" })
    assert.equal(calls[2].url, "https://the-public-board.vercel.app/api/board/messages/msg_root/edit")
    assert.equal(calls[3].url, "https://the-public-board.vercel.app/api/board/messages/msg_slash%2Fid/delete")
    assert.equal(essayClientId("abc"), "at-essay-abc")
    assert.equal(reviewClientId("abc"), "at-review-abc")
})

test("board client surfaces HTTP errors without retrying 4xx", async () => {
    const api = createBoardClient({
        url: "https://the-public-board.vercel.app/api/board",
        token: "test-token",
        fetch: async () => new Response(JSON.stringify({ error: "nope" }), { status: 400 }),
    })
    await assert.rejects(() => api.post("artificial-thought", "x", "id"), (error: unknown) => {
        assert.ok(error instanceof BoardApiError)
        assert.equal(error.status, 400)
        assert.equal(error.retryable, false)
        assert.doesNotMatch(error.message, /test-token/)
        return true
    })
})

test("queue messages keep plain task jobs and add board cross-posts", () => {
    const task: TaskQueueMessage = { taskId: "task-1" }
    const board: TaskQueueMessage = { type: "board_crosspost", kind: "essay", id: "essay-1" }
    assert.equal(isBoardCrosspostMessage(task), false)
    assert.equal(isBoardCrosspostMessage(board), true)
    assert.equal(queueJobLabel(task), "task task-1")
    assert.equal(queueJobLabel(board), "board_crosspost essay essay-1")
})

test("only published topics are cross-posted", () => {
    assert.equal(topicIsPublished({ published_at: "2026-11-20T13:00:00.000Z" }), true)
    assert.equal(topicIsPublished({ published_at: null }), false)
    assert.equal(topicIsPublished(undefined), false)
})

test("0010 stores idempotent cross-posts and cascades when a topic is deleted", () => {
    const db = openMigrated()
    db.exec(readFileSync(new URL("../fixtures/sample-content.sql", import.meta.url), "utf8"))
    db.prepare(
        `INSERT INTO board_crossposts (id, kind, essay_id, review_id, board_message_id, client_id, created_at)
         VALUES ('c-essay', 'essay', '33333333-3333-4333-8333-333333333333', NULL, 'msg_root', 'at-essay-33333333-3333-4333-8333-333333333333', '2026-11-20T00:00:00.000Z')`,
    ).run()
    db.prepare(
        `INSERT INTO board_crossposts (id, kind, essay_id, review_id, board_message_id, client_id, created_at)
         VALUES ('c-review', 'review', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-555555555555', 'msg_reply', 'at-review-55555555-5555-4555-8555-555555555555', '2026-11-20T00:01:00.000Z')`,
    ).run()

    assert.throws(() => {
        db.prepare(
            `INSERT INTO board_crossposts (id, kind, essay_id, review_id, board_message_id, client_id, created_at)
             VALUES ('c-essay-2', 'essay', '33333333-3333-4333-8333-333333333333', NULL, 'msg_other', 'at-essay-dup', '2026-11-20T00:02:00.000Z')`,
        ).run()
    })

    db.prepare("DELETE FROM topics WHERE id = ?").run("11111111-1111-4111-8111-111111111111")
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM board_crossposts").get().n, 0)
})
