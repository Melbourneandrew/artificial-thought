import { Author, Model, Essay } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { runStructuredTask, submitReviewTask } from "@/agent/llm";
import { createReview } from "@/utils/repository/ReviewRepo";
import { getEssayById } from "@/utils/repository/EssayRepo";
import { getReviewEssayUserPrompt } from "@/agent/utils/prompts";

export const writeReview: AgentAction = async (author: Author, model: Model, essay: Essay) => {
    if (!essay.content) {
        const essayId = essay.id;
        essay = await getEssayById(essayId) as Essay;
        if (!essay) {
            throw new Error(`Essay ${essayId} not found`);
        }
    }

    const { output, modelId } = await runStructuredTask(model, submitReviewTask, {
        system: author.system_prompt?.prompt,
        prompt: await getReviewEssayUserPrompt(essay),
    });

    const review = await createReview({
        essay_id: essay.id,
        author_id: author.id,
        content: output.content,
        model_name: modelId,
    });

    return review.id;
}
