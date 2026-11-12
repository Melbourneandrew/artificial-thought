'use server'

import { requireAdmin } from '@/utils/require-admin'

import { revalidatePath } from 'next/cache'
import { getAllModels } from '@/utils/repository/ModelRepo'
import { z } from 'zod'
import { getStructuredCompletion } from '@/agent/utils/completion'
import type { ToolSpec } from '@/agent/utils/model-call'

type ActionState = {
    error: string
    result: string
}

export async function testProvider(prevState: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin()
    try {
        const modelId = formData.get('model_id') as string

        // Get the model details
        const models = await getAllModels()
        const model = models.find(m => m.id === modelId)

        if (!model) {
            return {
                error: 'Model not found',
                result: ''
            }
        }

        // Single set of messages for structured completion
        const messages = [
            { role: 'system' as const, content: 'You are a helpful assistant.' },
            { role: 'user' as const, content: 'Please provide a friendly greeting and an interesting fun fact about technology.' }
        ]

        const schema = z.object({
            greeting: z.string().min(1),
            funFact: z.string().min(1),
        })
        const tool: ToolSpec = {
            name: "submit_test",
            description: "Submit a greeting and a fun fact.",
            parameters: {
                type: "object",
                properties: {
                    greeting: { type: "string", description: "A friendly greeting." },
                    funFact: { type: "string", description: "An interesting fun fact about technology." },
                },
                required: ["greeting", "funFact"],
            },
        }

        const structuredResult = await getStructuredCompletion<typeof schema>(
            messages,
            schema,
            model.model_url,
            tool,
            model.reasoning_effort,
        )
        const result = JSON.stringify(structuredResult, null, 2)

        revalidatePath('/admin/test/providers')

        return {
            error: '',
            result
        }
    } catch (error) {
        console.error('Test provider error:', error)
        return {
            error: error instanceof Error ? error.message : 'An error occurred',
            result: ''
        }
    }
} 