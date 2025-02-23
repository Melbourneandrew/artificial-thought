// when an author creates a topic, they will request essays.

import { Author, Model, Task, Topic } from "@/types";
import { AgentAction } from "../agent_types";
import { getAllAuthors } from "@/utils/repository/AuthorRepo";
import { createWriteEssayTask } from "@/utils/repository/TaskRepo";

export const requestEssays: AgentAction = async (author: Author, model: Model, topic: Topic, parent: Task) => {
    const authors = await getAllAuthors();

    for (const author of authors) {
        const task = await createWriteEssayTask(author, topic, parent);
    }

    return "Essays requested";
}
