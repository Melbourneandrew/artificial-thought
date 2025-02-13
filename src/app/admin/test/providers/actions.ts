'use server'

import { getChatCompletion } from '@/agent/utils/completion'
import { Model } from '@/types'
import { revalidatePath } from 'next/cache'
import { getAllModels } from '@/utils/repository/ModelRepo'

type ActionState = {
    error: string
    result: string
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

        // Test message for the model
        const messages = [
            { role: 'system' as const, content: 'You are a helpful assistant.' },
            { role: 'user' as const, content: 'Please respond with "Hello, I am working correctly!"' }
        ]

        const result = await getChatCompletion(
            messages,
            model.model_name,
            model.model_url
        )

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