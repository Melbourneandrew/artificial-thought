import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';
import { createLLMClient } from "llm-polyglot";
import Instructor from "@instructor-ai/instructor";

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
    model: string,
    completionUrl: string
): Promise<z.infer<T>> {
    console.log('🔍 Getting structured completion for:', completionUrl);

    const apiKey = apiKeyMap[completionUrl];
    if (!apiKey) {
        throw new Error(`No API key found for URL: ${completionUrl}`);
    }

    try {
        let client;
        if (completionUrl === 'https://api.anthropic.com/v1/messages') {
            const anthropicClient = createLLMClient({
                provider: "anthropic",
                apiKey
            });
            client = Instructor<typeof anthropicClient>({
                client: anthropicClient,
                mode: "TOOLS"
            });
        } else {
            const openai = new OpenAI({
                baseURL: completionUrl,
                apiKey,
            });
            client = Instructor({
                client: openai,
                mode: "TOOLS"
            });
        }

        const completion = await client.chat.completions.create({
            model,
            messages,
            response_model: {
                // @ts-ignore
                schema,
                name: "structured_output"
            },
            max_tokens: 2000,
        });
        console.log('🔍 Structured completion:', completion);

        return completion;
    } catch (error) {
        console.error('Error getting structured chat completion:', error);
        throw error;
    }
}

const apiKeyMap: Record<string, string | undefined> = {
    'https://api.openai.com/v1': process.env.OPENAI_API_KEY,
    'https://api.anthropic.com/v1/messages': process.env.ANTHROPIC_API_KEY,
    'https://generativelanguage.googleapis.com/v1beta/openai': process.env.GEMINI_API_KEY,
    'https://api.deepseek.com': process.env.DEEPSEEK_API_KEY,
    'https://api.mistral.ai/v1': process.env.MISTRAL_API_KEY,
    'https://api.groq.com/openai/v1': process.env.GROQ_API_KEY,
}