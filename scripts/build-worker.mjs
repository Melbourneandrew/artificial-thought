import * as esbuild from "esbuild"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["cloudflare/worker.ts"],
    outfile: "cloudflare/dist/worker.js",
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "esnext",
    conditions: ["workerd", "worker", "browser"],
    alias: {
        "@": path.join(root, "src"),
    },
    define: {
        "process.env.AT_RUNTIME": JSON.stringify("worker-job"),
    },
    external: ["node:async_hooks"],
    plugins: [
        {
            name: "worker-externals",
            setup(build) {
                build.onResolve({ filter: /\/request-config$/ }, () => ({
                    path: path.join(root, "src/utils/request-config.worker.ts"),
                }))
                build.onResolve({ filter: /open-next\/worker\.js$/ }, () => ({
                    path: "../../.open-next/worker.js",
                    external: true,
                }))
                build.onResolve({ filter: /^node:/ }, (args) => ({
                    path: args.path,
                    external: true,
                }))
                build.onResolve({ filter: /^cloudflare:/ }, (args) => ({
                    path: args.path,
                    external: true,
                }))
            },
        },
    ],
})

console.log("Built cloudflare/dist/worker.js")
