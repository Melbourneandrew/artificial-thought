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

import { apiFormatFor, buildModelInput, extractMessageText, restPathFor, writeEssayTool } from "../src/agent/utils/model-call.ts"

const messages = [
    { role: "system" as const, content: "You write essays." },
    { role: "user" as const, content: "Write about tides." },
]

test("request format follows the model's native API on the binding path", () => {
    assert.equal(apiFormatFor("anthropic/claude-sonnet-5.5"), "anthropic")
    assert.equal(apiFormatFor("openai/gpt-6.1-sol"), "responses")
    assert.equal(apiFormatFor("meta/muse-spark-1.3"), "responses")
    assert.equal(apiFormatFor("google/gemini-4-carbon"), "chat")
    assert.equal(apiFormatFor("xai/grok-4.7"), "chat")
    assert.equal(apiFormatFor("moonshotai/kimi-k3.1-pro"), "chat")
    assert.equal(apiFormatFor("@cf/deepseek-ai/deepseek-v4.1-flash-1017"), "chat")
    assert.equal(restPathFor("anthropic"), "ai/v1/messages")
    assert.equal(restPathFor("responses"), "ai/v1/responses")
    assert.equal(restPathFor("chat"), "ai/v1/chat/completions")
})

test("Anthropic input forces the tool with low effort and a top-level system prompt", () => {
    const input = buildModelInput("anthropic/claude-sonnet-5.5", messages, writeEssayTool, "low")
    assert.equal(input.system, "You write essays.")
    assert.deepEqual(input.messages, [{ role: "user", content: "Write about tides." }])
    assert.deepEqual(input.tool_choice, { type: "tool", name: "write_essay" })
    assert.deepEqual(input.output_config, { effort: "low" })
    assert.equal((input.tools as Array<{ input_schema: unknown }>)[0].input_schema, writeEssayTool.parameters)
    assert.equal("temperature" in input, false)
    assert.equal("thinking" in input, false)
})

test("Responses input forces the function with low reasoning", () => {
    const input = buildModelInput("openai/gpt-6.1-sol", messages, writeEssayTool, null)
    assert.equal(input.instructions, "You write essays.")
    assert.deepEqual(input.input, [{ role: "user", content: "Write about tides." }])
    assert.deepEqual(input.tool_choice, { type: "function", name: "write_essay" })
    assert.deepEqual(input.reasoning, { effort: "low" })
    assert.equal("temperature" in input, false)
    assert.equal("messages" in input, false)
})

test("chat input keeps temperature only for Workers AI models", () => {
    const cf = buildModelInput("@cf/qwen/qwen3.8-27b", messages, writeEssayTool, "low")
    assert.equal(cf.temperature, 0.7)
    assert.equal(cf.reasoning_effort, "low")
    assert.deepEqual(cf.tool_choice, { type: "function", function: { name: "write_essay" } })
    const gateway = buildModelInput("moonshotai/kimi-k3.1-pro", messages, writeEssayTool, "low")
    assert.equal("temperature" in gateway, false)
    assert.equal(gateway.reasoning_effort, "low")
})

test("tool arguments are read from Anthropic and Responses payloads", () => {
    const anthropic = { content: [{ type: "text", text: "ok" }, { type: "tool_use", name: "write_essay", input: { title: "T", description: "D", body: "B" } }] }
    assert.deepEqual(extractToolArguments(anthropic), { title: "T", description: "D", body: "B" })
    const responses = { output: [{ type: "reasoning" }, { type: "function_call", name: "write_essay", arguments: JSON.stringify({ title: "T", description: "D", body: "B" }) }] }
    assert.deepEqual(extractToolArguments(responses), { title: "T", description: "D", body: "B" })
    assert.equal(extractMessageText({ output_text: "hello" }), "hello")
    assert.equal(extractMessageText({ content: [{ type: "text", text: "hi" }] }), "hi")
})
