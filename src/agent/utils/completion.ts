import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export async function getChatCompletion(
    messages: ChatCompletionMessageParam[],
    model: string,
    completionUrl: string
): Promise<string> {
    const apiKey = apiKeyMap[completionUrl];
    if (!apiKey) {
        throw new Error(`No API key found for URL: ${completionUrl}`);
    }

    const openai = new OpenAI({
        baseURL: completionUrl,
        apiKey,
    });

    try {
        const completion = await openai.chat.completions.create({
            model,
            messages
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
    const apiKey = apiKeyMap[completionUrl];
    if (!apiKey) {
        throw new Error(`No API key found for URL: ${completionUrl}`);
    }

    const openai = new OpenAI({
        baseURL: completionUrl,
        apiKey,
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
    'https://api.openai.com/v1': process.env.OPENAI_API_KEY,
    'https://api.anthropic.com/v1/messages': process.env.ANTHROPIC_API_KEY,
    'https://generativelanguage.googleapis.com/v1beta/openai/': process.env.GEMINI_API_KEY,
    'https://api.deepseek.com': process.env.DEEPSEEK_API_KEY,
    'https://api.mistral.ai/v1': process.env.MISTRAL_API_KEY,
    'https://api.groq.com/openai/v1': process.env.GROQ_API_KEY,
}