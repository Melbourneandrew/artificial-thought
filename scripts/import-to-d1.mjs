import { spawnSync } from "node:child_process"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const databaseName = "artificial-thought"

function usage() {
    console.error("Usage: scripts/import-to-d1.sh <sqlite-file> [--local|--remote]")
    process.exit(1)
}

const args = process.argv.slice(2).filter((arg) => arg !== "--")
const fileArg = args.find((arg) => !arg.startsWith("--"))
const remote = args.includes("--remote")
if (!fileArg) usage()

const sqliteFile = path.resolve(fileArg)
const db = new DatabaseSync(sqliteFile, { readOnly: true })

function sqlLiteral(value) {
    if (value === null || value === undefined) return "NULL"
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL"
    if (typeof value === "bigint") return value.toString()
    return `'${String(value).replaceAll("'", "''")}'`
}

function rows(table) {
    return db.prepare(`SELECT * FROM ${table}`).all()
}

function insertStatement(table, row, columns, overrides = {}) {
    const names = columns.join(", ")
    const values = columns.map((column) => sqlLiteral(overrides[column] !== undefined ? overrides[column] : row[column])).join(", ")
    return `INSERT OR REPLACE INTO ${table} (${names}) VALUES (${values});`
}

const tempDir = mkdtempSync(path.join(tmpdir(), "at-d1-import-"))
let batch = []
let batchBytes = 0
let batchIndex = 0
const files = []

function flush() {
    if (batch.length === 0) return
    const file = path.join(tempDir, `batch-${String(batchIndex).padStart(4, "0")}.sql`)
    writeFileSync(file, batch.join("\n") + "\n")
    files.push(file)
    batch = []
    batchBytes = 0
    batchIndex += 1
}

function push(statement) {
    if (batchBytes + statement.length > 900_000) flush()
    batch.push(statement)
    batchBytes += statement.length
    if (batch.length >= 250) flush()
}

function wrangler(extra) {
    const result = spawnSync("npx", ["wrangler", ...extra], {
        cwd: root,
        stdio: "inherit",
        env: process.env,
    })
    if (result.status !== 0) {
        throw new Error(`wrangler exited ${result.status}`)
    }
}

const target = remote ? "--remote" : "--local"
console.log(`Importing ${sqliteFile} into D1 database ${databaseName} (${remote ? "remote" : "local"})`)

wrangler(["d1", "migrations", "apply", databaseName, target])

push("DELETE FROM task_logs;")
push("DELETE FROM tasks;")
push("DELETE FROM reviews;")
push("DELETE FROM essays;")
push("DELETE FROM topics;")
flush()

const prompts = rows("prompts")
for (const row of prompts) {
    push(insertStatement("prompts", row, ["prompt_key", "prompt", "created_at"]))
}
const models = rows("models")
for (const row of models) {
    // Upsert so the reasoning_effort column set by migrations survives the import.
    const columns = ["id", "model_name", "model_url", "created_at"]
    push(`INSERT INTO models (${columns.join(", ")}) VALUES (${columns.map((c) => sqlLiteral(row[c])).join(", ")}) ON CONFLICT(id) DO UPDATE SET model_name = excluded.model_name, model_url = excluded.model_url, created_at = excluded.created_at;`)
}
const authorColumns = db.prepare("PRAGMA table_info(authors)").all().map((column) => column.name)
const authors = rows("authors")
for (const row of authors) {
    const columns = ["id", "name", "model_id", "bio", "system_prompt_key", "profile_picture_url", "created_at"]
    if (authorColumns.includes("status")) columns.push("status", "retired_at", "lineage")
    push(insertStatement("authors", row, columns))
}
flush()

for (const row of rows("topics")) {
    push(insertStatement("topics", row, ["id", "title", "slug", "created_by_author_id", "created_by_user_name", "published_at", "scheduled_for", "created_at"]))
}
flush()
for (const row of rows("essays")) {
    push(insertStatement("essays", row, ["id", "title", "description", "content", "topic_id", "author_id", "model_name", "created_at"]))
}
flush()
const reviewColumns = db.prepare("PRAGMA table_info(reviews)").all().map((column) => column.name)
for (const row of rows("reviews")) {
    const columns = ["id", "essay_id", "author_id", "content", "created_at"]
    if (reviewColumns.includes("model_name")) columns.push("model_name")
    push(insertStatement("reviews", row, columns))
}
flush()

const tasks = rows("tasks")
for (const row of tasks) {
    push(insertStatement("tasks", row, ["id", "prompt", "author_id", "topic_id", "essay_id", "review_id", "parent_task_id", "created_at", "completed_at"], { parent_task_id: null }))
}
flush()
for (const row of tasks) {
    if (!row.parent_task_id) continue
    push(`UPDATE tasks SET parent_task_id = ${sqlLiteral(row.parent_task_id)} WHERE id = ${sqlLiteral(row.id)};`)
}
flush()
for (const row of rows("task_logs")) {
    push(insertStatement("task_logs", row, ["id", "task_id", "created_at", "content"]))
}
flush()

console.log(`Applying ${files.length} SQL batches`)
for (const file of files) {
    wrangler(["d1", "execute", databaseName, target, `--file=${file}`])
}

console.log("Refreshing Cloudflare model ids, avatars, and added authors")
wrangler(["d1", "execute", databaseName, target, "--file=migrations/0002_catalog.sql"])
console.log("Reapplying active and retired author lineage")
wrangler(["d1", "execute", databaseName, target, "--file=migrations/0006_author_lineage.sql"])
console.log("Reapplying the latest model catalog")
wrangler(["d1", "execute", databaseName, target, "--file=migrations/0007_latest_models.sql"])
wrangler(["d1", "execute", databaseName, target, "--file=migrations/0008_claude_opus.sql"])
wrangler(["d1", "execute", databaseName, target, "--file=migrations/0009_qwen_glm.sql"])

rmSync(tempDir, { recursive: true, force: true })
console.log("Import finished")
