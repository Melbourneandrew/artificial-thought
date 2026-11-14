import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { DatabaseSync } from "node:sqlite"
import { ACTIVE_AUTHOR_PREDICATE, isListedAuthor, isSchedulableAuthor } from "../src/utils/author-status.ts"

const CLAUDE = "a1b2c3d4-e5f6-4321-8765-1234abcd5678"
const CHATGPT = "b2c3d4e5-f6a7-5432-8765-2345bcde6789"
const GEMINI = "c1234567-89ab-cdef-0123-456789abcdef"
const DEEPSEEK = "d4e5f6a7-b8c9-0123-4567-89abcdef0123"
const MISTRAL = "72c62e70-d502-49e3-948b-b9b566b8d103"
const LLAMA = "28aa367b-d5ae-48ac-b235-3d216cd1738c"
const GROK = "f0a1b2c3-d4e5-4678-9abc-def012345678"

const HISTORICAL = [
    [CLAUDE, "claude-3-5-sonnet-latest", "aaaaaaaa-c1a1-4111-8111-00000000c1a1", "Claude 3.5 Sonnet"],
    [CHATGPT, "gpt-4o-2024-08-06", "aaaaaaaa-04a1-4111-8111-0000000004a1", "GPT-4o"],
    [GEMINI, "gemini-1.5-pro", "aaaaaaaa-03a1-4111-8111-0000000003a1", "Gemini 1.5 Pro"],
    [DEEPSEEK, "deepseek-chat", "aaaaaaaa-d5a1-4111-8111-00000000d5a1", "DeepSeek V3 (deepseek-chat)"],
    [MISTRAL, "mistral-large-latest", "aaaaaaaa-e5a1-4111-8111-00000000e5a1", "Mistral Large"],
    [LLAMA, "llama-3.3-70b-versatile", "aaaaaaaa-a5e5-4111-8111-00000000a5e5", "Llama 3.3 70B"],
] as const

function apply(db: DatabaseSync, name: string) {
    db.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8"))
}

function openMigrated() {
    const db = new DatabaseSync(":memory:")
    db.exec("PRAGMA foreign_keys = ON")
    for (const file of ["0001_init.sql", "0002_catalog.sql", "0003_reasoning.sql", "0004_public_cache.sql", "0005_author_status.sql"]) {
        apply(db, file)
    }
    return db
}

test("schedulers only treat active authors as eligible", () => {
    assert.equal(isSchedulableAuthor("active"), true)
    assert.equal(isSchedulableAuthor("retired"), false)
    assert.equal(isSchedulableAuthor(null), false)
    assert.equal(ACTIVE_AUTHOR_PREDICATE, "status = 'active'")
    assert.equal(isListedAuthor({ status: "retired", essay_count: 0 }), false)
    assert.equal(isListedAuthor({ status: "retired", essay_count: 3 }), true)
    assert.equal(isListedAuthor({ status: "active", essay_count: 0 }), true)
})

test("fresh catalog retires empty Llama 4 Scout and keeps Grok on 4.7", () => {
    const db = openMigrated()
    apply(db, "0006_author_lineage.sql")
    const llama = db.prepare("SELECT status, model_url FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = ?").get(LLAMA) as { status: string, model_url: string }
    assert.equal(llama.status, "retired")
    assert.equal(llama.model_url, "@cf/meta/llama-4-scout-17b-16e-instruct")
    const muse = db.prepare("SELECT a.name, a.status, m.model_url, m.reasoning_effort FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = 'aaaaaaaa-a5e5-4111-8111-00000000a5e5'").get() as { name: string, status: string, model_url: string, reasoning_effort: string }
    assert.equal(muse.name, "Muse Spark")
    assert.equal(muse.status, "active")
    assert.equal(muse.model_url, "meta/muse-spark-1.3")
    assert.equal(muse.reasoning_effort, "low")
    const grok = db.prepare("SELECT a.status, m.model_name, m.model_url, m.reasoning_effort FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = ?").get(GROK) as { status: string, model_name: string, model_url: string, reasoning_effort: string }
    assert.equal(grok.status, "active")
    assert.equal(grok.model_name, "Grok 4.7")
    assert.equal(grok.model_url, "xai/grok-4.7")
    assert.equal(grok.reasoning_effort, "low")
    const claude = db.prepare("SELECT status FROM authors WHERE id = ?").get(CLAUDE) as { status: string }
    assert.equal(claude.status, "active")
    assert.equal((db.prepare("SELECT value FROM app_meta WHERE key = 'public_cache'").get() as { value: string }).value, "2")
})

test("historical essays stay on the original author id", () => {
    const db = openMigrated()
    db.prepare(
        `INSERT INTO topics (id, title, slug, created_by_author_id, published_at, created_at)
         VALUES ('topic-lineage', 'Lineage', 'lineage-topic', ?, '2024-09-01T00:00:00.000Z', '2024-09-01T00:00:00.000Z')`,
    ).run(CLAUDE)
    for (const [authorId, modelName] of HISTORICAL) {
        db.prepare(
            `INSERT INTO essays (id, title, description, content, topic_id, author_id, model_name, created_at)
             VALUES (?, 'Essay', 'Desc', 'Body', 'topic-lineage', ?, ?, '2024-09-02T00:00:00.000Z')`,
        ).run(`essay-${authorId.slice(0, 8)}`, authorId, modelName)
    }
    db.prepare(
        `INSERT INTO reviews (id, essay_id, author_id, content, created_at)
         VALUES ('review-1', 'essay-a1b2c3d4', ?, 'A review', '2024-09-03T00:00:00.000Z')`,
    ).run(CHATGPT)
    db.prepare(
        `INSERT INTO tasks (id, prompt, author_id, topic_id, created_at)
         VALUES ('task-1', 'write_essay', ?, 'topic-lineage', '2024-09-02T00:00:00.000Z')`,
    ).run(CLAUDE)

    apply(db, "0006_author_lineage.sql")
    apply(db, "0006_author_lineage.sql")

    for (const [authorId, modelName, successorId, retiredModel] of HISTORICAL) {
        const retired = db.prepare(
            `SELECT a.status, a.id, m.model_name, (SELECT COUNT(*) FROM essays e WHERE e.author_id = a.id) AS essays
             FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = ?`,
        ).get(authorId) as { status: string, id: string, model_name: string, essays: number }
        assert.equal(retired.status, "retired", authorId)
        assert.equal(retired.model_name, retiredModel)
        assert.equal(retired.essays, 1)
        const essay = db.prepare("SELECT author_id, model_name FROM essays WHERE id = ?").get(`essay-${authorId.slice(0, 8)}`) as { author_id: string, model_name: string }
        assert.equal(essay.author_id, authorId)
        assert.equal(essay.model_name, modelName)
        const successor = db.prepare(
            `SELECT a.status, a.lineage, (SELECT COUNT(*) FROM essays e WHERE e.author_id = a.id) AS essays
             FROM authors a WHERE a.id = ?`,
        ).get(successorId) as { status: string, lineage: string, essays: number }
        assert.equal(successor.status, "active")
        assert.equal(successor.essays, 0)
        assert.equal(successor.lineage, retired.model_name === "Llama 3.3 70B" ? "llama" : successor.lineage)
    }

    const review = db.prepare("SELECT author_id, model_name FROM reviews WHERE id = 'review-1'").get() as { author_id: string, model_name: string }
    assert.equal(review.author_id, CHATGPT)
    assert.equal(review.model_name, "gpt-4o-2024-08-06")
    const task = db.prepare("SELECT author_id FROM tasks WHERE id = 'task-1'").get() as { author_id: string }
    assert.equal(task.author_id, CLAUDE)
    const topic = db.prepare("SELECT created_by_author_id FROM topics WHERE id = 'topic-lineage'").get() as { created_by_author_id: string }
    assert.equal(topic.created_by_author_id, CLAUDE)

    const active = db.prepare(`SELECT id FROM authors WHERE ${ACTIVE_AUTHOR_PREDICATE}`).all().map((row) => (row as { id: string }).id)
    for (const [authorId] of HISTORICAL) {
        assert.equal(active.includes(authorId), false, authorId)
    }
    assert.equal(active.includes("aaaaaaaa-c1a1-4111-8111-00000000c1a1"), true)
    assert.equal(active.includes("aaaaaaaa-a5e5-4111-8111-00000000a5e5"), true)
    assert.equal(active.includes(GROK), true)
    const successors = db.prepare("SELECT COUNT(*) AS n FROM authors WHERE id = 'aaaaaaaa-c1a1-4111-8111-00000000c1a1'").get() as { n: number }
    assert.equal(successors.n, 1)
    const muse = db.prepare("SELECT name FROM authors WHERE lineage = 'llama' AND status = 'active'").get() as { name: string }
    assert.equal(muse.name, "Muse Spark")

    // 0007 keeps every retired generation that has essays and moves the successors in place.
    apply(db, "0007_latest_models.sql")
    const retiredAfter = db.prepare("SELECT COUNT(*) AS n FROM authors WHERE status = 'retired'").get() as { n: number }
    assert.equal(retiredAfter.n, HISTORICAL.length)
    const claude = db.prepare("SELECT m.model_url FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = 'aaaaaaaa-c1a1-4111-8111-00000000c1a1'").get() as { model_url: string }
    assert.equal(claude.model_url, "anthropic/claude-sonnet-5.5")
    const retiredClaude = db.prepare("SELECT m.model_name FROM authors a JOIN models m ON m.id = a.model_id WHERE a.id = ?").get(CLAUDE) as { model_name: string }
    assert.equal(retiredClaude.model_name, "Claude 3.5 Sonnet")
})

test("import reapplies the lineage migration", () => {
    const source = readFileSync(new URL("../scripts/import-to-d1.mjs", import.meta.url), "utf8")
    assert.match(source, /0006_author_lineage\.sql/)
    assert.match(source, /0007_latest_models\.sql/)
})

test("0007 updates active authors in place and leaves no empty retired rows", () => {
    const fresh = openMigrated()
    apply(fresh, "0006_author_lineage.sql")
    apply(fresh, "0007_latest_models.sql")
    const emptyRetired = fresh.prepare(
        "SELECT COUNT(*) AS n FROM authors a WHERE a.status = 'retired' AND NOT EXISTS (SELECT 1 FROM essays e WHERE e.author_id = a.id)",
    ).get() as { n: number }
    assert.equal(emptyRetired.n, 0)
    const models = fresh.prepare(
        "SELECT a.name, m.model_url, m.reasoning_effort FROM authors a JOIN models m ON m.id = a.model_id WHERE a.status = 'active' ORDER BY a.name",
    ).all() as Array<{ name: string, model_url: string, reasoning_effort: string }>
    assert.deepEqual(models.map((row) => [row.name, row.model_url]), [
        ["ChatGPT", "openai/gpt-6.1-sol"],
        ["Claude", "anthropic/claude-sonnet-5.5"],
        ["DeepSeek", "@cf/deepseek-ai/deepseek-v4.1-flash-1017"],
        ["Gemini", "google/gemini-4-carbon"],
        ["Grok", "xai/grok-4.7"],
        ["Kimi", "moonshotai/kimi-k3.1-pro"],
        ["Mistral", "@cf/mistralai/mistral-small-3.1-24b-instruct"],
        ["Muse Spark", "meta/muse-spark-1.3"],
        ["Qwen", "@cf/qwen/qwen3.8-27b"],
    ])
    assert.ok(models.every((row) => row.reasoning_effort === "low" || row.model_url.includes("mistral-small")))
    const orphanModels = fresh.prepare(
        "SELECT COUNT(*) AS n FROM models m WHERE NOT EXISTS (SELECT 1 FROM authors a WHERE a.model_id = m.id)",
    ).get() as { n: number }
    assert.equal(orphanModels.n, 0)
    // Re-running is a no-op apart from the cache counter.
    apply(fresh, "0007_latest_models.sql")
    assert.equal((fresh.prepare("SELECT COUNT(*) AS n FROM authors").get() as { n: number }).n, 9)
})
