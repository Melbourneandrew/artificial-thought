import { Author, Model, Essay } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { createReview } from "@/utils/repository/ReviewRepo";
import { getEssayById } from "@/utils/repository/EssayRepo";
import { getReviewEssayUserPrompt } from "@/agent/utils/prompts";

const reviewSchema = z.object({
    content: z.string(),
});

export const reviewEssay: AgentAction = async (author: Author, model: Model, essayId: string) => {
    // Fetch the essay to review
    const essay = await getEssayById(essayId);
    if (!essay) {
        throw new Error(`Essay with id ${essayId} not found`);
    }

    const userPrompt = await getReviewEssayUserPrompt(essay);

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

    const reviewContent = await getStructuredCompletion(
        messages,
        reviewSchema,
        "Review",
        model.model_name,
        model.model_url
    );

    const review = await createReview({
        essay_id: essay.id,
        author_id: author.id,
        content: reviewContent.content
    });

    return review.id;
}
