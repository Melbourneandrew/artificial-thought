import { Author, Model, Topic } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { createEssay } from "@/utils/repository/EssayRepo";
import { getWriteEssayUserPrompt } from "@/agent/utils/prompts";

const essaySchema = z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
});

export const writeEssay: AgentAction = async (author: Author, model: Model, topic: Topic) => {
    const userPrompt = await getWriteEssayUserPrompt(topic);

    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: author.system_prompt_key
        },
        {
            role: "user",
            content: userPrompt
        }
    ];

    const essayContent = await getStructuredCompletion(
        messages,
        essaySchema,
        model.model_name,
        model.model_url
    );

    const essay = await createEssay({
        title: essayContent.title,
        description: essayContent.description,
        content: essayContent.content,
        topic_id: topic.id,
        author_id: author.id,
        model_id: model.id
    });

    return essay.id;
}

