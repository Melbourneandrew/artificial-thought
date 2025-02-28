import { Author, Model, Task, Topic } from "@/types"
import { writeEssay } from "./actions/write-essay";
import { writeTopic } from "./actions/write-topic";
import { writeReview } from "./actions/write-review";
import { requestEssays } from "./actions/request-essays";
import { requestReviews } from "./actions/request-reviews";
import { completeTask, createTaskLog } from "@/utils/repository/TaskRepo";
import { AgentAction } from "./agent_types";
import { getScheduledTopic, publishScheduledTopic } from "@/utils/repository/TopicRepo";

export async function executeTask(task: Task) {
    const { author } = task;
    try {
        if (!author) throw new Error("Task has no author");

        const { agentAction, params } = await getAgentAction(task);

        await agentAction(author, author.model!, ...params);
        await completeTask(task.id);
    } catch (error) {
        console.error("Error executing task: ", error);
        await createTaskLog(task.id, error instanceof Error ? error.message : String(error));
        await completeTask(task.id);
    }
}

export async function getAgentAction(task: Task): Promise<{ agentAction: AgentAction, params: any }> {
    const { prompt, topic, essay } = task;

    /*
        This is where a function calling completion could be used to select a function.
        Since the actions in the Artificial Thought system are fairly discrete in their execution and intended order
        we will just use a switch statement to determine the action to take.
    */
    switch (prompt) {
        case "write_essay":
            return {
                agentAction: writeEssayAndRequestReviews,
                params: [topic, task]
            }
        case "write_review":
            return {
                agentAction: writeReview,
                params: [essay, task]
            }
        case "write_topic":
            return {
                agentAction: writeTopicAndRequestEssays,
                params: [task]
            }
    }

    throw new Error(`No agent action found for prompt: ${prompt}`);
}

// Meta-action that writes a topic and requests essays.
const writeTopicAndRequestEssays: AgentAction = async (author: Author, model: Model, parent: Task) => {
    // Check for scheduled topics first
    const scheduledTopic = await getScheduledTopic();
    let topic: Topic;
    if (scheduledTopic) {
        // If there's a scheduled topic, use that instead of writing a new one
        console.log("Using scheduled topic");
        await publishScheduledTopic(scheduledTopic);
        topic = scheduledTopic;
    } else {
        console.log("Writing new topic");
        topic = await writeTopic(author, model);
    }

    await requestEssays(author, model, topic, parent);
}

// Meta-action that writes an essay then requests reviews.
const writeEssayAndRequestReviews: AgentAction = async (author: Author, model: Model, topic: Topic, parent: Task) => {
    const essay = await writeEssay(author, model, topic, parent);
    await requestReviews(author, model, essay, parent);
}