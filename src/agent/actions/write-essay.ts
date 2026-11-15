import { Author, Essay, Model, Topic } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { runStructuredTask, writeEssayTask } from "@/agent/llm";
import { createEssay } from "@/utils/repository/EssayRepo";
import { getWriteEssayUserPrompt } from "@/agent/utils/prompts";

export const writeEssay: AgentAction = async (author: Author, model: Model, topic: Topic): Promise<Essay> => {
    const { output, modelId } = await runStructuredTask(model, writeEssayTask, {
        system: author.system_prompt?.prompt,
        prompt: await getWriteEssayUserPrompt(topic),
    });

    return createEssay({
        title: output.title,
        description: output.description,
        content: output.body,
        topic_id: topic.id,
        author_id: author.id,
        model_name: modelId
    });
}
