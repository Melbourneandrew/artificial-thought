import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { writeEssayTask, submitReviewTask, writeTopicTask } from "../src/agent/llm/structured-task.ts"
import {
    PLACEHOLDER_FILLERS,
    PUBLISHED_PROMPT_KEYS,
    describePlaceholders,
    publishedPromptFromRow,
    toolFieldNames,
    writingToolSummary,
} from "../src/app/about/published-prompts.ts"

test("the About page publishes the four live prompts in order", () => {
    assert.deepEqual([...PUBLISHED_PROMPT_KEYS], [
        "author-system-prompt",
        "essay-writing-prompt",
        "review-writing-prompt",
        "topic-writing-prompt",
    ])
    const catalog = readFileSync(new URL("../migrations/0002_catalog.sql", import.meta.url), "utf8")
    for (const key of PUBLISHED_PROMPT_KEYS) {
        assert.match(catalog, new RegExp(`'${key}'`))
    }
})

test("placeholder explanations cover the catalog templates", () => {
    const catalog = readFileSync(new URL("../migrations/0002_catalog.sql", import.meta.url), "utf8")
    const block = catalog.slice(catalog.indexOf("INSERT INTO prompts"), catalog.indexOf("ON CONFLICT(prompt_key)"))
    const names = [...block.matchAll(/\{\{([a-z0-9_]+)\}\}/gi)].map((match) => match[1])
    assert.deepEqual([...new Set(names)], ["topic", "essay_title", "essay_content", "previous_topics"])
    for (const name of new Set(names)) {
        assert.ok(PLACEHOLDER_FILLERS[name], name)
    }
    const review = describePlaceholders('Review "{{essay_title}}". Essay: {{essay_content}}. Title again {{essay_title}}.')
    assert.deepEqual(review.map((item) => item.name), ["essay_title", "essay_content"])
})

test("the writing-tool summary uses the structured task names and fields", () => {
    const summary = writingToolSummary(writeEssayTask, submitReviewTask, writeTopicTask)
    assert.match(summary, new RegExp(writeEssayTask.name))
    assert.match(summary, new RegExp(submitReviewTask.name))
    assert.match(summary, new RegExp(writeTopicTask.name))
    for (const field of toolFieldNames(writeEssayTask)) {
        assert.match(summary, new RegExp(field))
    }
    assert.deepEqual(toolFieldNames(writeEssayTask), ["title", "description", "body"])
    assert.match(summary, /Reasoning is set to low/)
    const rendered = publishedPromptFromRow(
        "essay-writing-prompt",
        "Write an essay about {{topic}}.",
    )
    assert.equal(rendered.summary, "The user prompt for writing an essay on the day's topic.")
    assert.equal(rendered.placeholders[0]?.name, "topic")
})

test("editing a prompt bumps the public cache", () => {
    const source = readFileSync(new URL("../src/utils/repository/PromptRepo.ts", import.meta.url), "utf8")
    assert.match(source, /bumpPublicCache/)
    assert.match(source, /updatePromptByKey/)
})
