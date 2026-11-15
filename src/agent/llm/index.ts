import { getRuntimeConfig } from "@/utils/db"
import { createGatewayProvider } from "./gateway-provider.ts"
import { generateStructured, type StructuredRequest, type StructuredResult } from "./generate-structured.ts"
import { mockOutput } from "./mock-output.ts"
import { resolveModel, type ModelRecord } from "./model-registry.ts"
import type { StructuredTask, TaskOutput } from "./structured-task.ts"

export { ModelCallError, ModelConfigurationError, StructuredOutputError } from "./errors.ts"
export type { StructuredRequest, StructuredResult } from "./generate-structured.ts"
export type { ModelRecord } from "./model-registry.ts"
export { defineStructuredTask, submitReviewTask, writeEssayTask, writeTopicTask } from "./structured-task.ts"

/**
 * Runs one structured task with the model stored on an author's `models` row,
 * through AI Gateway. In mock mode (LLM_MODE=mock) it returns placeholder output
 * and makes no call.
 */
export async function runStructuredTask<Task extends StructuredTask>(
    record: ModelRecord,
    task: Task,
    request: StructuredRequest,
): Promise<StructuredResult<TaskOutput<Task>>> {
    const config = await getRuntimeConfig()
    if (config.llmMode === "mock" || process.env.TASK_TESTING_MODE === "true") {
        return { output: mockOutput(task), modelId: record.model_url.trim() }
    }
    const provider = createGatewayProvider({
        binding: config.ai,
        accountId: config.accountId,
        apiToken: config.apiToken,
        gatewayId: config.gatewayId,
    })
    return generateStructured(resolveModel(record, provider), task, request)
}
