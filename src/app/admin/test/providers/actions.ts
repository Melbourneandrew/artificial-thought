'use server'

import { requireAdmin } from '@/utils/require-admin'

import { revalidatePath } from 'next/cache'
import { getAllModels } from '@/utils/repository/ModelRepo'
import { z } from 'zod'
import { defineStructuredTask, runStructuredTask } from '@/agent/llm'

type ActionState = {
    error: string
    result: string
}

const providerTestTask = defineStructuredTask({
    name: 'submit_test',
    description: 'Submit a greeting and a fun fact.',
    schema: z.object({
        greeting: z.string().min(1).describe('A friendly greeting.'),
        funFact: z.string().min(1).describe('An interesting fun fact about technology.'),
    }),
})

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

        const structuredResult = await runStructuredTask(model, providerTestTask, {
            system: 'You are a helpful assistant.',
            prompt: 'Please provide a friendly greeting and an interesting fun fact about technology.',
        })
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