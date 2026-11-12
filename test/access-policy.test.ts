import assert from "node:assert/strict"
import test from "node:test"
import { isDevAccessBypass, isPlaceholderAccessConfig } from "../src/utils/access-policy.ts"

test("dev bypass requires development and an explicit flag", () => {
    assert.equal(isDevAccessBypass({ NODE_ENV: "development", CF_ACCESS_DEV_BYPASS: "true" }), true)
    assert.equal(isDevAccessBypass({ NODE_ENV: "production", CF_ACCESS_DEV_BYPASS: "true" }), false)
    assert.equal(isDevAccessBypass({ NODE_ENV: "development", CF_ACCESS_DEV_BYPASS: "false" }), false)
    assert.equal(isDevAccessBypass({ NODE_ENV: "development" }), false)
})

test("placeholder Access config fails closed", () => {
    assert.equal(isPlaceholderAccessConfig("", ""), true)
    assert.equal(isPlaceholderAccessConfig("your-team.cloudflareaccess.com", "real-aud"), true)
    assert.equal(isPlaceholderAccessConfig("team.cloudflareaccess.com", "replace-with-access-application-aud"), true)
    assert.equal(isPlaceholderAccessConfig("team.cloudflareaccess.com", "a1b2c3d4e5f6"), false)
})
