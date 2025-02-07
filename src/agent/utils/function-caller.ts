import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/chat/completions';
import { FunctionDefinition, FunctionCallResult } from '../agent_types';

export async function callFunction(
    prompt: string,
    functions: FunctionDefinition[],
    previousMessages: ChatCompletionMessage[] = []
): Promise<FunctionCallResult> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
            ...previousMessages,
            { role: 'user', content: prompt }
        ],
        functions,
        function_call: 'auto',
    });

    const functionCall = response.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.name) {
        throw new Error('No function call returned from OpenAI');
    }

    return {
        functionName: functionCall.name,
        parameters: JSON.parse(functionCall.arguments),
    };
}
