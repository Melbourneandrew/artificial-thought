import { Author, Model } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { runStructuredTask, writeTopicTask } from "@/agent/llm";
import { createTopic, getPreviousTopics } from "@/utils/repository/TopicRepo";
import { getWriteTopicUserPrompt } from "@/agent/utils/prompts";

export const writeTopic: AgentAction = async (author: Author, model: Model) => {
    const previousTopics = await getPreviousTopics(5);
    const { output } = await runStructuredTask(model, writeTopicTask, {
        system: author.system_prompt?.prompt,
        prompt: await getWriteTopicUserPrompt(previousTopics),
    });

    return createTopic({
        title: output.title,
        created_by_author_id: author.id,
        published_at: new Date().toISOString()
    });
}
