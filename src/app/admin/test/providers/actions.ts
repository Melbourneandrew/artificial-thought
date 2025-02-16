'use server'

import { getChatCompletion } from '@/agent/utils/completion'
import { Model } from '@/types'
import { revalidatePath } from 'next/cache'
import { getAllModels } from '@/utils/repository/ModelRepo'
import { z } from 'zod'
import { getStructuredCompletion } from '@/agent/utils/completion'

type ActionState = {
    error: string
    result: string
}

type TestResponse = {
    greeting: string
    funFact: string
}

export async function testProvider(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        const url = formData.get('url') as string
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
            greeting: z.string().describe('A friendly greeting'),
            funFact: z.string().describe('An interesting fun fact about technology')
        })

        const structuredResult = await getStructuredCompletion<typeof schema>(
            messages,
            schema,
            'TestResponse',
            model.model_name,
            model.model_url
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