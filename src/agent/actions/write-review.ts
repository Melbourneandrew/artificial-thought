import { Author, Model, Essay } from "@/types";
import { AgentAction } from "@/agent/agent_types";
import { getStructuredCompletion } from "@/agent/utils/completion";
import { z } from "zod";
import { ChatMessage } from "@/agent/utils/completion";
import { createReview } from "@/utils/repository/ReviewRepo";
import { getEssayById } from "@/utils/repository/EssayRepo";
import { getReviewEssayUserPrompt } from "@/agent/utils/prompts";

const reviewSchema = z.object({
    content: z.string().describe("The review of the essay"),
});

export const writeReview: AgentAction = async (author: Author, model: Model, essay: Essay) => {
    if (!essay.content) {
        const essayId = essay.id;
        essay = await getEssayById(essayId) as Essay;
        if (!essay) {
            throw new Error(`Essay ${essayId} not found`);
        }
    }

    const userPrompt = await getReviewEssayUserPrompt(essay);

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

    const reviewContent = await getStructuredCompletion(
        messages,
        reviewSchema,
        model.model_url
    );

    const review = await createReview({
        essay_id: essay.id,
        author_id: author.id,
        content: reviewContent.completion.content
    });

    return review.id;
}
