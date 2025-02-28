// when an author creates an essay, they will request reviews.

import { getAllAuthors } from "@/utils/repository/AuthorRepo";
import { AgentAction } from "../agent_types";
import { Author, Essay, Model, Task } from "@/types";
import { createWriteReviewTask } from "@/utils/repository/TaskRepo";

export const requestReviews: AgentAction = async (author: Author, model: Model, essay: Essay, parent: Task) => {
    const authors = await getAllAuthors();

    for (const author of authors) {
        if (author.id === parent.author_id) continue; // authors don't review their own essays
        await createWriteReviewTask(author, essay, parent);
    }

    return "Reviews requested";
}