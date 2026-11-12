import { Author, Essay, Model, Topic } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { ChatMessage, getStructuredCompletion } from "@/agent/utils/completion";
import { writeEssayTool } from "@/agent/utils/model-call";
import { z } from "zod";
import { createEssay } from "@/utils/repository/EssayRepo";
import { getWriteEssayUserPrompt } from "@/agent/utils/prompts";

const essaySchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    body: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
});

export const writeEssay: AgentAction = async (author: Author, model: Model, topic: Topic): Promise<Essay> => {
    const userPrompt = await getWriteEssayUserPrompt(topic);

    const messages: ChatMessage[] = [
        {
            role: "system",
            content: author.system_prompt?.prompt || ""
        },
        {
            role: "user",
            content: userPrompt
        }
    ];

    const { completion: essayContent, model: essayModel } = await getStructuredCompletion(
        messages,
        essaySchema,
        model.model_url,
        writeEssayTool,
        model.reasoning_effort,
    );

    const body = essayContent.body || essayContent.content
    if (!body) throw new Error("Essay tool call did not include a body")

    const essay = await createEssay({
        title: essayContent.title,
        description: essayContent.description,
        content: body,
        topic_id: topic.id,
        author_id: author.id,
        model_name: essayModel
    });

    return essay;
}

