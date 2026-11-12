import assert from "node:assert/strict"
import test from "node:test"
import { isCacheablePublicPath, publicCacheKey } from "../src/utils/public-cache.ts"

test("public content paths are cacheable and admin paths are not", () => {
    for (const path of ["/", "/about", "/essays", "/essays/abc", "/topics", "/topics/today", "/topics/id/abc", "/authors", "/authors/abc"]) {
        assert.equal(isCacheablePublicPath(path), true, path)
    }
    assert.equal(isCacheablePublicPath("/admin"), false)
    assert.equal(isCacheablePublicPath("/admin/prompts"), false)
    assert.equal(isCacheablePublicPath("/_next/static/chunk.js"), false)
})

test("cache keys include the generation and ignore the original host details except path", () => {
    const request = new Request("https://artificial-thought.melbourneandrew.workers.dev/essays?page=2")
    const key = new URL(publicCacheKey(request, "7").url)
    assert.equal(key.pathname, "/essays")
    assert.equal(key.searchParams.get("page"), "2")
    assert.equal(key.searchParams.get("__cv"), "7")
})
