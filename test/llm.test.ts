import assert from "node:assert/strict"
import test from "node:test"
import { APICallError } from "ai"
import { MockLanguageModelV4 } from "ai/test"
import { createAI } from "agents/models/ai-sdk"
import type { LanguageModelV4GenerateResult } from "@ai-sdk/provider"
import { ModelCallError, StructuredOutputError } from "../src/agent/llm/errors.ts"
import { generateStructured, parseJsonObject } from "../src/agent/llm/generate-structured.ts"
import { mockOutput } from "../src/agent/llm/mock-output.ts"
import { reasoningLevel, resolveModel, type ResolvedModel } from "../src/agent/llm/model-registry.ts"
import { submitReviewTask, writeEssayTask, writeTopicTask } from "../src/agent/llm/structured-task.ts"

const request = { system: "You write essays.", prompt: "Write about tides." }
const essay = { title: "Tides", description: "On the moon's pull.", body: "The sea breathes twice a day." }

type Captured = { model?: string, inputs?: Record<string, unknown>, options?: Record<string, unknown>, url?: string, body?: Record<string, unknown> }

/** A stand-in for the Workers AI binding: `run` serves @cf and catalog ids, `fetch` serves vendor model objects. */
function fakeBinding(reply: { run?: unknown, fetch?: unknown, status?: number }) {
    const captured: Captured = {}
    const binding = {
        async run(model: string, inputs: Record<string, unknown>, options: Record<string, unknown>) {
            Object.assign(captured, { model, inputs, options })
            return Response.json(reply.run, { status: reply.status ?? 200 })
        },
        async fetch(input: RequestInfo | URL, init?: RequestInit) {
            const req = new Request(input, init)
            captured.url = req.url
            captured.body = await req.json() as Record<string, unknown>
            return Response.json(reply.fetch, { status: reply.status ?? 200 })
        },
    }
    return { ai: createAI({ binding: binding as unknown as Ai, id: "default" }), captured }
}

function chatToolReply(name: string, args: object) {
    return {
        id: "chat-1",
        model: "served-model",
        choices: [{
            index: 0,
            finish_reason: "tool_calls",
            message: { role: "assistant", content: null, tool_calls: [{ id: "call-1", type: "function", function: { name, arguments: JSON.stringify(args) } }] },
        }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }
}

function mockModel(result: Partial<LanguageModelV4GenerateResult> | (() => never)): MockLanguageModelV4 {
    return new MockLanguageModelV4({
        doGenerate: typeof result === "function" ? result : {
            content: [],
            finishReason: { unified: "stop", raw: "stop" },
            usage: {
                inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
                outputTokens: { total: 1, text: 1, reasoning: 0 },
            },
            warnings: [],
            ...result,
        },
    })
}

function asResolved(model: MockLanguageModelV4): ResolvedModel {
    return { id: "test/model", route: "catalog", model, settings: { maxOutputTokens: 1000, reasoning: "low", strictTools: false, toolChoice: "tool" } }
}

test("reasoning_effort maps to the AI SDK reasoning level, defaulting to low", () => {
    assert.equal(reasoningLevel(null), "low")
    assert.equal(reasoningLevel(""), "low")
    assert.equal(reasoningLevel("skip"), "provider-default")
    assert.equal(reasoningLevel("off"), "none")
    assert.equal(reasoningLevel("HIGH"), "high")
    assert.equal(reasoningLevel("max"), "max")
    assert.equal(reasoningLevel("bogus"), "low")
})

test("models resolve to a route with per-route call settings", () => {
    const { ai } = fakeBinding({})
    const cases: Array<[string, string, number, number | undefined, boolean, "tool" | "required" | "auto"]> = [
        ["@cf/qwen/qwen3.8-27b", "workers-ai", 4096, 0.7, false, "tool"],
        ["anthropic/claude-opus-5.5", "anthropic", 16000, undefined, true, "tool"],
        ["openai/gpt-6.1-sol", "openai-responses", 8192, undefined, true, "tool"],
        ["meta/muse-spark-1.3", "catalog", 8192, undefined, false, "auto"],
        ["moonshotai/kimi-k3.1-pro", "catalog", 8192, undefined, false, "required"],
        ["alibaba/qwen3.8-max", "catalog", 8192, undefined, false, "required"],
        ["google/gemini-4-carbon", "catalog", 8192, undefined, false, "tool"],
    ]
    for (const [id, route, maxOutputTokens, temperature, strictTools, toolChoice] of cases) {
        const resolved = resolveModel({ model_url: ` ${id} `, reasoning_effort: "low" }, ai)
        assert.equal(resolved.id, id)
        assert.equal(resolved.route, route, id)
        assert.deepEqual(resolved.settings, { maxOutputTokens, temperature, reasoning: "low", strictTools, toolChoice }, id)
    }
    assert.equal(resolveModel({ model_url: "anthropic/claude-opus-5.5" }, ai).model.modelId, "claude-opus-5-5")
    assert.equal(resolveModel({ model_url: "openai/gpt-6.1-sol" }, ai).model.modelId, "gpt-6.1-sol")
    assert.throws(() => resolveModel({ model_url: "gpt-4o" }, ai), TypeError)
})

test("generateStructured forces the task tool and returns its validated input", async () => {
    const model = mockModel({
        content: [{ type: "tool-call", toolCallId: "1", toolName: "write_essay", input: JSON.stringify(essay) }],
        finishReason: { unified: "tool-calls", raw: "tool_calls" },
    })
    const result = await generateStructured(asResolved(model), writeEssayTask, request)
    assert.deepEqual(result.output, essay)
    const call = model.doGenerateCalls[0]
    assert.deepEqual(call.toolChoice, { type: "tool", toolName: "write_essay" })
    assert.equal(call.maxOutputTokens, 1000)
    assert.equal(call.reasoning, "low")
    assert.deepEqual(call.tools?.map((tool) => tool.name), ["write_essay"])
    assert.match(JSON.stringify(call.prompt[0]), /You write essays\.\\n\\nRespond by calling the write_essay tool exactly once\./)
})

test("a JSON object in a text reply is accepted when the model skips the tool", async () => {
    const model = mockModel({ content: [{ type: "text", text: "```json\n{\"content\": \"Sharp and kind.\"}\n```" }] })
    const result = await generateStructured(asResolved(model), submitReviewTask, request)
    assert.deepEqual(result.output, { content: "Sharp and kind." })
    assert.equal(parseJsonObject("no json here"), undefined)
})

test("output that fails the schema raises StructuredOutputError", async () => {
    const model = mockModel({ content: [{ type: "text", text: "I would rather not." }] })
    await assert.rejects(generateStructured(asResolved(model), writeTopicTask, request), (error: unknown) => {
        assert.ok(error instanceof StructuredOutputError)
        assert.equal(error.taskName, "write_topic")
        return true
    })
})

test("provider failures raise ModelCallError with the HTTP status", async () => {
    const model = mockModel(() => {
        throw new APICallError({ message: "Insufficient unified billing credits", url: "gateway", requestBodyValues: {}, statusCode: 402, isRetryable: false })
    })
    await assert.rejects(generateStructured(asResolved(model), writeTopicTask, request), (error: unknown) => {
        assert.ok(error instanceof ModelCallError)
        assert.equal(error.status, 402)
        assert.match(error.message, /Insufficient unified billing credits/)
        return true
    })
})

test("Workers AI ids go through env.AI.run as a forced chat tool call", async () => {
    const { ai, captured } = fakeBinding({ run: chatToolReply("write_topic", { title: "Tides" }) })
    const result = await generateStructured(resolveModel({ model_url: "@cf/qwen/qwen3.8-27b", reasoning_effort: null }, ai), writeTopicTask, request)
    assert.deepEqual(result.output, { title: "Tides" })
    assert.equal(captured.model, "@cf/qwen/qwen3.8-27b")
    assert.deepEqual(captured.inputs?.tool_choice, { type: "function", function: { name: "write_topic" } })
    assert.equal(captured.inputs?.reasoning_effort, "low")
    assert.equal(captured.inputs?.max_tokens, 4096)
    assert.equal(captured.inputs?.temperature, 0.7)
    assert.deepEqual(captured.options?.gateway, { id: "default" })
})

test("the saved model id is the configured catalog id, not the id the provider reports", async () => {
    const reply = { ...chatToolReply("submit_review", { content: "Clear and fair." }), model: "@cf/mistralai/mistral-small-3.1-24b-v2" }
    const { ai } = fakeBinding({ run: reply })
    const result = await generateStructured(
        resolveModel({ model_url: "@cf/mistralai/mistral-small-3.1-24b-instruct", reasoning_effort: "skip" }, ai),
        submitReviewTask,
        request,
    )
    assert.equal(result.modelId, "@cf/mistralai/mistral-small-3.1-24b-instruct")
    assert.equal(result.servedModelId, "@cf/mistralai/mistral-small-3.1-24b-v2")
})

test("skip sends no reasoning field and catalog ids keep the default temperature", async () => {
    const { ai, captured } = fakeBinding({ run: chatToolReply("write_topic", { title: "Tides" }) })
    await generateStructured(resolveModel({ model_url: "meta/muse-spark-1.3", reasoning_effort: "skip" }, ai), writeTopicTask, request)
    assert.equal("reasoning_effort" in (captured.inputs ?? {}), false)
    assert.equal("temperature" in (captured.inputs ?? {}), false)
    assert.equal(captured.inputs?.max_completion_tokens, 8192)
    assert.equal(captured.options?.openaiEndpoint, "/v1/chat/completions")
    assert.equal(captured.inputs?.tool_choice, "auto")
})

test("Kimi and Qwen send tool_choice required; Muse Spark stays on auto", async () => {
    for (const [id, expected] of [
        ["moonshotai/kimi-k3.1-pro", "required"],
        ["alibaba/qwen3.8-max", "required"],
        ["meta/muse-spark-1.3", "auto"],
    ] as const) {
        const { ai, captured } = fakeBinding({ run: chatToolReply("write_topic", { title: "Tides" }) })
        await generateStructured(resolveModel({ model_url: id, reasoning_effort: "low" }, ai), writeTopicTask, request)
        assert.equal(captured.inputs?.tool_choice, expected, id)
        assert.equal(captured.inputs?.reasoning_effort, "low", id)
    }
})

test("Claude Opus 5.5 goes to the gateway's Anthropic endpoint with auto tool choice and a strict tool", async () => {
    const { ai, captured } = fakeBinding({
        fetch: {
            id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5",
            content: [{ type: "tool_use", id: "tu_1", name: "write_essay", input: essay }],
            stop_reason: "tool_use", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20 },
        },
    })
    const result = await generateStructured(resolveModel({ model_url: "anthropic/claude-opus-5.5", reasoning_effort: "low" }, ai), writeEssayTask, request)
    assert.deepEqual(result.output, essay)
    assert.equal(result.modelId, "anthropic/claude-opus-5.5")
    assert.equal(result.servedModelId, "claude-opus-5-5")
    assert.match(captured.url ?? "", /\/ai-gateway\/gateways\/default\/anthropic\/v1\/messages$/)
    const body = captured.body ?? {}
    assert.equal(body.model, "claude-opus-5-5")
    assert.deepEqual(body.tool_choice, { type: "auto" })
    const tools = body.tools as Array<{ name: string, strict?: boolean }>
    assert.deepEqual(tools.map((tool) => [tool.name, tool.strict]), [["write_essay", true]])
    assert.deepEqual(body.output_config, { effort: "low" })
    assert.equal(body.max_tokens, 16000)
})

test("a Claude 5.5 text reply that carries the JSON object is still accepted", async () => {
    const { ai } = fakeBinding({
        fetch: {
            id: "msg_2", type: "message", role: "assistant", model: "claude-sonnet-5-5",
            content: [{ type: "text", text: `Here it is: ${JSON.stringify({ content: "Sharp and kind." })}` }],
            stop_reason: "end_turn", stop_sequence: null,
            usage: { input_tokens: 10, output_tokens: 20 },
        },
    })
    const result = await generateStructured(resolveModel({ model_url: "anthropic/claude-sonnet-5.5" }, ai), submitReviewTask, request)
    assert.deepEqual(result.output, { content: "Sharp and kind." })
})

test("GPT-6.1 goes to the gateway's OpenAI Responses endpoint with a forced function", async () => {
    const { ai, captured } = fakeBinding({
        fetch: {
            id: "resp_1", object: "response", created_at: 0, model: "gpt-6.1-sol", status: "completed",
            output: [{ type: "function_call", id: "fc_1", call_id: "call_1", name: "write_topic", arguments: JSON.stringify({ title: "Tides" }), status: "completed" }],
            usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
        },
    })
    const result = await generateStructured(resolveModel({ model_url: "openai/gpt-6.1-sol", reasoning_effort: "low" }, ai), writeTopicTask, request)
    assert.deepEqual(result.output, { title: "Tides" })
    assert.match(captured.url ?? "", /\/ai-gateway\/gateways\/default\/openai\/v1\/responses$/)
    const body = captured.body ?? {}
    assert.deepEqual(body.tool_choice, { type: "function", name: "write_topic" })
    assert.equal((body.reasoning as { effort: string }).effort, "low")
    assert.equal(body.max_output_tokens, 8192)
})

test("a substantive plain-text review is accepted when the model skips the tool", async () => {
    const review = "The distinction between recognizing a feeling and actually having one is drawn clearly, and the examples make the gap easy to hold onto. Does that change how we should talk about companion systems?"
    const model = mockModel({ content: [{ type: "text", text: review }] })
    const result = await generateStructured(asResolved(model), submitReviewTask, request)
    assert.deepEqual(result.output, { content: review })
})

test("a short or empty text reply is not accepted as a review", async () => {
    const model = mockModel({ content: [{ type: "text", text: "Nice essay." }] })
    await assert.rejects(generateStructured(asResolved(model), submitReviewTask, request), StructuredOutputError)
})

test("a substantive plain-text essay is derived into title, description, and body", async () => {
    const body = Array.from({ length: 5 }, () => "The sea breathes twice a day under the pull of the moon, a rhythm older than our words for it.").join("\n\n")
    const model = mockModel({ content: [{ type: "text", text: `# Tides\n\n${body}` }] })
    const result = await generateStructured(asResolved(model), writeEssayTask, request)
    assert.equal(result.output.title, "Tides")
    assert.equal(result.output.body, body)
    assert.ok(result.output.description.length > 0)
})

test("a short essay status line is not derived into an essay", async () => {
    const model = mockModel({ content: [{ type: "text", text: "Writing your essay on AI and human emotions — crafting something informative and engaging." }] })
    await assert.rejects(generateStructured(asResolved(model), writeEssayTask, request), StructuredOutputError)
})

test("an empty tool-call argument object falls back to a substantive text essay", async () => {
    const body = Array.from({ length: 5 }, () => "The sea breathes twice a day under the pull of the moon, a rhythm older than our words for it.").join("\n\n")
    const model = mockModel({
        content: [
            { type: "text", text: body },
            { type: "tool-call", toolCallId: "1", toolName: "write_essay", input: "{}" },
        ],
        finishReason: { unified: "tool-calls", raw: "tool_calls" },
    })
    const result = await generateStructured(asResolved(model), writeEssayTask, request)
    assert.equal(result.output.body, body)
    assert.ok(result.output.title.length > 0)
})

test("an embedded tool-call JSON envelope in the text is accepted", async () => {
    const model = mockModel({
        content: [{ type: "text", text: `<|tool_call|>{"name":"submit_review","arguments":{"content":"The distinction is clear, and the examples give it weight. What would count as a felt reply?"}}` }],
    })
    const result = await generateStructured(asResolved(model), submitReviewTask, request)
    assert.equal(result.output.content, "The distinction is clear, and the examples give it weight. What would count as a felt reply?")
})

test("a topic written as a refusal is still rejected", async () => {
    const model = mockModel({ content: [{ type: "text", text: "I would rather not." }] })
    await assert.rejects(generateStructured(asResolved(model), writeTopicTask, request), StructuredOutputError)
})

test("mock output fills every task field", () => {
    assert.deepEqual(Object.keys(mockOutput(writeEssayTask)), ["title", "description", "body"])
})
