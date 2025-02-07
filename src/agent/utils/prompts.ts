import { getPromptByKey } from "@/utils/repository/PromptRepo"
import { Topic, Essay } from "@/types"

export async function getWriteEssayUserPrompt(topic: Topic): Promise<string> {
    const prompt = await getPromptByKey('essay-writing-prompt')
    if (!prompt) throw new Error('Essay writing prompt template not found')

    return prompt.prompt.replace('{{topic}}', topic.title)
}

export async function getReviewEssayUserPrompt(essay: Essay): Promise<string> {
    const prompt = await getPromptByKey('review-writing-prompt')
    if (!prompt) throw new Error('Essay review prompt template not found')

    return prompt.prompt
        .replace('{{essay_title}}', essay.title)
        .replace('{{essay_content}}', essay.content)
}