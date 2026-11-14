import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { DatabaseSync } from "node:sqlite"

function openMigrated() {
    const db = new DatabaseSync(":memory:")
    db.exec("PRAGMA foreign_keys = ON")
    db.exec(readFileSync(new URL("../migrations/0001_init.sql", import.meta.url), "utf8"))
    db.exec(readFileSync(new URL("../migrations/0002_catalog.sql", import.meta.url), "utf8"))
    db.exec(readFileSync(new URL("../migrations/0003_reasoning.sql", import.meta.url), "utf8"))
    db.exec(readFileSync(new URL("../migrations/0004_public_cache.sql", import.meta.url), "utf8"))
    return db
}

test("catalog seeds the original authors plus Grok, Kimi, and Qwen", () => {
    const db = openMigrated()
    const names = db.prepare("SELECT name FROM authors ORDER BY name").all().map((row) => row.name)
    assert.deepEqual(names, ["ChatGPT", "Claude", "DeepSeek", "Gemini", "Grok", "Kimi", "Llama", "Mistral", "Qwen"])
    const claude = db.prepare("SELECT model_url, profile_picture_url FROM models m JOIN authors a ON a.model_id = m.id WHERE a.name = 'Claude'").get()
    assert.equal(claude.model_url, "anthropic/claude-sonnet-5.5")
    assert.equal(claude.profile_picture_url, "/authors/anthropic.svg")
    const deepseek = db.prepare("SELECT reasoning_effort FROM models WHERE model_url = '@cf/deepseek-ai/deepseek-v4.1-flash-1017'").get() as { reasoning_effort: string }
    assert.equal(deepseek.reasoning_effort, "low")
    const gpt = db.prepare("SELECT reasoning_effort FROM models WHERE model_url = 'openai/gpt-6.1-sol'").get() as { reasoning_effort: string }
    assert.equal(gpt.reasoning_effort, "low")
})

test("deleting a topic cascades to essays, reviews, tasks, and logs", () => {
    const db = openMigrated()
    db.exec(readFileSync(new URL("../fixtures/sample-content.sql", import.meta.url), "utf8"))
    const claude = "a1b2c3d4-e5f6-4321-8765-1234abcd5678"
    db.prepare("INSERT INTO tasks (id, prompt, author_id, created_at) VALUES ('root', 'write_topic', ?, '2026-11-11T13:00:00.000Z')").run(claude)
    db.prepare("INSERT INTO tasks (id, prompt, author_id, topic_id, parent_task_id, created_at) VALUES ('child', 'write_essay', ?, '11111111-1111-4111-8111-111111111111', 'root', '2026-11-11T13:01:00.000Z')").run(claude)
    db.prepare("INSERT INTO task_logs (id, task_id, created_at, content) VALUES ('log', 'child', '2026-11-11T13:02:00.000Z', 'boom')").run()

    db.prepare("DELETE FROM topics WHERE id = ?").run("11111111-1111-4111-8111-111111111111")

    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM topics WHERE id = '11111111-1111-4111-8111-111111111111'").get().n, 0)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM essays WHERE topic_id = '11111111-1111-4111-8111-111111111111'").get().n, 0)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviews").get().n, 0)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE id = 'child'").get().n, 0)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM task_logs").get().n, 0)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE id = 'root'").get().n, 1)
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM topics").get().n, 1)
})

test("sample fixture renders two published topics", () => {
    const db = openMigrated()
    db.exec(readFileSync(new URL("../fixtures/sample-content.sql", import.meta.url), "utf8"))
    const topics = db.prepare("SELECT slug FROM topics WHERE published_at IS NOT NULL ORDER BY published_at").all()
    assert.equal(topics.length, 2)
    const essay = db.prepare("SELECT title FROM essays WHERE id = '44444444-4444-4444-8444-444444444444'").get()
    assert.equal(essay.title, "Shelves With a Point of View")
})
