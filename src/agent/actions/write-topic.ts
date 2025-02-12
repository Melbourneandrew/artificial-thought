import { Author, Model } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { createTopic } from "@/utils/repository/TopicRepo";

const topicSchema = z.object({
    title: z.string(),
});

export const writeTopic: AgentAction = async (author: Author, model: Model) => {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: author.system_prompt_key
        },
        {
            role: "user",
            content: "Generate an interesting and specific topic for an essay. The topic should be thought-provoking and focused enough for a detailed analysis."
        }
    ];

    const topicContent = await getStructuredCompletion(
        messages,
        topicSchema,
        "Topic",
        model.model_name,
        model.model_url
    );

    const topic = await createTopic({
        title: topicContent.title,
        published_at: new Date().toISOString()
    });

    return topic.id;
}
