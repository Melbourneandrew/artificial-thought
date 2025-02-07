import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export async function getChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string,
    completionUrl: string
): Promise<string> {
    const openai = new OpenAI({
        baseURL: completionUrl,
        apiKey: apiKeyMap[model] ?? process.env.OPENAI_API_KEY,
    });

    try {
        const completion = await openai.chat.completions.create({
            messages,
            model,
            temperature: 0.7,
        });

        return completion.choices[0].message.content || '';
    } catch (error) {
        console.error('Error getting chat completion:', error);
        throw error;
    }
}

export async function getStructuredCompletion<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    schemaName: string,
    model: string,
    completionUrl: string
): Promise<z.infer<T>> {
    console.log('🔍 Getting structured completion for:', completionUrl);
    const openai = new OpenAI({
        baseURL: completionUrl,
        apiKey: apiKeyMap[model] ?? process.env.OPENAI_API_KEY,
    });

    try {
        const completion = await openai.beta.chat.completions.parse({
            messages,
            model,
            temperature: 0.7,
            response_format: zodResponseFormat(schema, schemaName),
        });

        return completion.choices[0].message.parsed;
    } catch (error) {
        console.error('Error getting structured chat completion:', error);
        throw error;
    }
}

const apiKeyMap: Record<string, string | undefined> = {
    'gpt-4o': process.env.OPENAI_API_KEY,
    'claude-3.5-turbo': process.env.ANTHROPIC_API_KEY,
    'gemini-1.5-pro': process.env.GEMINI_API_KEY,
    'deepseek-r1-distill-llama-70b': process.env.DEEPSEEK_API_KEY,
    'mixtral-8x7b-32768': process.env.MISTRAL_API_KEY,
    'llama-3.1-70b-versatile': process.env.LLAMA_API_KEY,
}