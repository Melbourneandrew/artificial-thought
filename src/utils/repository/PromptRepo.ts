import { all, one, run } from "@/utils/db"
import { Prompt } from "@/types"

export async function getPromptByKey(promptKey: string): Promise<Prompt | null> {
    return one<Prompt>(
        `SELECT prompt_key, prompt, created_at FROM prompts WHERE prompt_key = ? LIMIT 1`,
        promptKey,
    )
}

export async function listPrompts(): Promise<Prompt[]> {
    return all<Prompt>(`SELECT prompt_key, prompt, created_at FROM prompts ORDER BY prompt_key`)
}

export async function updatePromptByKey(promptKey: string, newPrompt: string): Promise<void> {
    await run(`UPDATE prompts SET prompt = ? WHERE prompt_key = ?`, newPrompt, promptKey)
}
