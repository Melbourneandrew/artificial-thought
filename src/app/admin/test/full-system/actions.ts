'use server'

import { redirect } from 'next/navigation'
import { Author } from '@/types'
import { createWriteTopicTask } from '@/utils/repository/TaskRepo'

export type CreateTopicTaskState = {
    message: string
    taskId?: string
    error?: string
}

export async function createTopicTaskAction(
    prevState: CreateTopicTaskState,
    formData: FormData
): Promise<CreateTopicTaskState> {
    let taskId: string;

    try {
        const authorId = formData.get('authorId') as string

        if (!authorId) {
            return {
                message: 'Please select an author',
                error: 'Missing required fields'
            }
        }

        // Get the full author object from the form data
        const author = JSON.parse(formData.get('authorData') as string) as Author

        if (!author.model) {
            return {
                message: 'Selected author has no associated model',
                error: 'Invalid author configuration'
            }
        }

        const task = await createWriteTopicTask(author, null)
        taskId = task.id

    } catch (error) {
        console.error('Error creating topic task:', error)
        return {
            message: 'Failed to create topic task',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }

    redirect(`/admin/test/full-system/view?taskId=${taskId}`)
} 
