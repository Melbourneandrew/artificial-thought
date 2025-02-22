import { Author, Model } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { createTopic, getPreviousTopics } from "@/utils/repository/TopicRepo";
import { getWriteTopicUserPrompt } from "@/agent/utils/prompts";
const topicSchema = z.object({
    title: z.string(),
});


export const writeTopic: AgentAction = async (author: Author, model: Model) => {
    const previousTopics = await getPreviousTopics(5);
    const userPrompt = await getWriteTopicUserPrompt(previousTopics);

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

    const topicContent = await getStructuredCompletion(
        messages,
        topicSchema,
        model.model_name,
        model.model_url,
        "topic"
    );

    const topic = await createTopic({
        title: topicContent.completion.title,
        published_at: new Date().toISOString()
    });

    return topic.id;
}
