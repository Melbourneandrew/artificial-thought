import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';
import { createLLMClient } from "llm-polyglot";
import Instructor from "@instructor-ai/instructor";
import { zodResponseFormat } from "openai/helpers/zod";

const apiKeyMap: Record<string, string | undefined> = {
    'https://api.openai.com/v1': process.env.OPENAI_API_KEY,
    'https://api.anthropic.com/v1/messages': process.env.ANTHROPIC_API_KEY,
    'https://generativelanguage.googleapis.com/v1beta/openai': process.env.GEMINI_API_KEY,
    'https://api.deepseek.com': process.env.DEEPSEEK_API_KEY,
    'https://api.mistral.ai/v1': process.env.MISTRAL_API_KEY,
    'https://api.groq.com/openai/v1': process.env.GROQ_API_KEY,
}

// Map URLs to their respective structured completion functions
const providerMap: Record<string, Function> = {
    'https://api.openai.com/v1': getStructuredCompletionOpenAI,
    'https://api.anthropic.com/v1/messages': getStructuredCompletionAnthropic,
    'https://generativelanguage.googleapis.com/v1beta/openai': getStructuredCompletionOpenAI,
    'https://api.deepseek.com': getStructuredCompletionDeepseek,
    'https://api.mistral.ai/v1': getStructuredCompletionOpenAI,
    'https://api.groq.com/openai/v1': getStructuredCompletionGroq,
    'default': getStructuredCompletionOpenAI
};

// Add this type definition after the imports
type StructuredCompletionOutput<T> = {
    model: string;
    completion: T;
};

export async function getStructuredCompletion<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    model: string,
    baseUrl: string,
    schemaName: string = "structured_output"
): Promise<StructuredCompletionOutput<z.infer<T>>> {
    if (process.env.TASK_TESTING_MODE === 'true') {
        const dummyData = generateDummyData(schema);
        return {
            model,
            completion: dummyData
        };
    }

    const apiKey = apiKeyMap[baseUrl];
    if (!apiKey) {
        throw new Error(`No API key found for URL: ${baseUrl}`);
    }

    const provider = providerMap[baseUrl] || providerMap.default;
    return provider(messages, schema, model, baseUrl, apiKey, schemaName);
}

async function getStructuredCompletionAnthropic<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    model: string,
    baseUrl: string,
    apiKey: string,
    schemaName: string
): Promise<StructuredCompletionOutput<z.infer<T>>> {
    const anthropicClient = createLLMClient({
        provider: "anthropic",
        apiKey
    });
    const client = Instructor<typeof anthropicClient>({
        client: anthropicClient,
        mode: "TOOLS"
    });

    const completion = await client.chat.completions.create({
        model,
        messages,
        response_model: {
            schema: schema as unknown as z.ZodObject<any>,
            name: schemaName
        },
        max_tokens: 2000,
    });

    return {
        model,
        completion: completion
    };
}

async function getStructuredCompletionGroq<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    model: string,
    baseUrl: string,
    apiKey: string,
    schemaName: string
): Promise<StructuredCompletionOutput<z.infer<T>>> {
    const openai = new OpenAI({
        baseURL: baseUrl,
        apiKey,
    });
    const client = Instructor({
        client: openai,
        mode: "TOOLS"
    });

    const completion = await client.chat.completions.create({
        model,
        messages,
        response_model: {
            schema: schema as unknown as z.ZodObject<any>,
            name: schemaName
        },
        max_tokens: 2000,
    });

    return {
        model,
        completion: completion
    };
}

async function getStructuredCompletionOpenAI<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    model: string,
    baseUrl: string,
    apiKey: string,
    schemaName: string
): Promise<StructuredCompletionOutput<z.infer<T>>> {
    const openai = new OpenAI({
        apiKey,
        baseURL: baseUrl,
    });

    const completion = await openai.beta.chat.completions.parse({
        model,
        messages,
        response_format: zodResponseFormat(schema, schemaName),
    });

    return {
        model: completion.model ?? model,
        completion: completion.choices[0].message.parsed
    };
}

async function getStructuredCompletionDeepseek<T extends z.ZodType>(
    messages: ChatCompletionMessageParam[],
    schema: T,
    model: string,
    baseUrl: string,
    apiKey: string,
): Promise<StructuredCompletionOutput<z.infer<T>>> {
    const openai = new OpenAI({
        baseURL: baseUrl,
        apiKey,
    });

    // Generate example data from the schema
    const exampleData = generateDummyData(schema);

    // Create a system message that explains the schema
    const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `Please provide responses in the following JSON format:

EXAMPLE OUTPUT:
${JSON.stringify(exampleData, null, 2)}

Ensure the response matches this exact structure.`
    };

    // Add the system message at the start of the messages array
    const augmentedMessages = [systemMessage, ...messages];

    const completion = await openai.chat.completions.create({
        model,
        messages: augmentedMessages,
        response_format: { type: 'json_object' }
    });

    // Parse the JSON response
    const parsedResponse = JSON.parse(completion.choices[0].message.content!);

    // Validate against the schema
    const validatedResponse = schema.parse(parsedResponse);

    return {
        model: completion.model ?? model,
        completion: validatedResponse
    };
}

function generateDummyData(schema: z.ZodType): any {
    if (schema instanceof z.ZodString) {
        return "TEST_STRING";
    } else if (schema instanceof z.ZodNumber) {
        return 42;
    } else if (schema instanceof z.ZodBoolean) {
        return true;
    } else if (schema instanceof z.ZodArray) {
        return [generateDummyData(schema.element)];
    } else if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const dummyObj: Record<string, any> = {};
        for (const [key, value] of Object.entries(shape)) {
            dummyObj[key] = generateDummyData(value as z.ZodType);
        }
        return dummyObj;
    } else if (schema instanceof z.ZodEnum) {
        return schema.options[0];
    } else if (schema instanceof z.ZodLiteral) {
        return schema.value;
    }
    return "TEST_FALLBACK";
}