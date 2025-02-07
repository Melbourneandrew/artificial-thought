import { FunctionDefinition } from "openai/resources/index.mjs";

export const availableActions: FunctionDefinition[] = [
    {
        name: 'write_essay',
        description: 'Write an essay based on the given topic and requirements',
    },
    {
        name: 'review_essay',
        description: 'Review and provide feedback on an essay'
    }
]