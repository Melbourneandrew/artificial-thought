import { Author, Model } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatMessage } from "@/agent/utils/completion";
import { createTopic, getPreviousTopics } from "@/utils/repository/TopicRepo";
import { getWriteTopicUserPrompt } from "@/agent/utils/prompts";
const topicSchema = z.object({
    title: z.string(),
});


export const writeTopic: AgentAction = async (author: Author, model: Model) => {
    const previousTopics = await getPreviousTopics(5);
    const userPrompt = await getWriteTopicUserPrompt(previousTopics);

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

    const topicContent = await getStructuredCompletion(
        messages,
        topicSchema,
        model.model_url
    );

    const topic = await createTopic({
        title: topicContent.completion.title,
        created_by_author_id: author.id,
        published_at: new Date().toISOString()
    });

    return topic;
}
