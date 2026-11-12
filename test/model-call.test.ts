import assert from "node:assert/strict"
import test from "node:test"
import {
    DEFAULT_REASONING_EFFORT,
    extractToolArguments,
    reasoningFields,
} from "../src/agent/utils/model-call.ts"

test("default reasoning effort is low and can be skipped or turned off", () => {
    assert.equal(DEFAULT_REASONING_EFFORT, "low")
    assert.deepEqual(reasoningFields(null), { reasoning_effort: "low" })
    assert.deepEqual(reasoningFields("none"), { reasoning_effort: "none" })
    assert.deepEqual(reasoningFields("skip"), {})
    assert.deepEqual(reasoningFields("off"), { chat_template_kwargs: { enable_thinking: false } })
})

test("tool call arguments are read from an OpenAI-style response", () => {
    const payload = {
        choices: [{
            message: {
                tool_calls: [{
                    function: {
                        name: "write_essay",
                        arguments: JSON.stringify({ title: "Hello", body: "Body" }),
                    },
                }],
            },
        }],
    }
    assert.deepEqual(extractToolArguments(payload), { title: "Hello", body: "Body" })
})

test("tool call arguments may already be objects", () => {
    const payload = {
        tool_calls: [{ name: "submit_review", arguments: { content: "Nice." } }],
    }
    assert.deepEqual(extractToolArguments(payload), { content: "Nice." })
})

test("missing tool calls return null", () => {
    assert.equal(extractToolArguments({ choices: [{ message: { content: "plain text" } }] }), null)
})
