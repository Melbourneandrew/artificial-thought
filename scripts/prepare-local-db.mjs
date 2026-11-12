import { spawnSync } from "node:child_process"
import { readdirSync, statSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function wrangler(args) {
    const result = spawnSync("npx", ["wrangler", ...args], {
        cwd: root,
        stdio: "inherit",
        env: process.env,
    })
    if (result.status !== 0) {
        throw new Error(`wrangler exited ${result.status}`)
    }
}

wrangler(["d1", "migrations", "apply", "artificial-thought", "--local"])

const dir = path.join(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject")
const sqliteFiles = readdirSync(dir)
    .filter((name) => name.endsWith(".sqlite"))
    .map((name) => path.join(dir, name))
    .sort((a, b) => statSync(b).size - statSync(a).size)

if (sqliteFiles.length === 0) {
    throw new Error(`No local D1 sqlite file found in ${dir}`)
}

const db = new DatabaseSync(sqliteFiles[0], { readOnly: true })
const count = Number(db.prepare("SELECT COUNT(*) AS n FROM topics").get().n)
db.close()

if (count === 0) {
    console.log("Local D1 has no topics. Loading fixtures/sample-content.sql")
    wrangler(["d1", "execute", "artificial-thought", "--local", "--file=fixtures/sample-content.sql"])
} else {
    console.log(`Local D1 already has ${count} topics. Leaving it in place.`)
}
