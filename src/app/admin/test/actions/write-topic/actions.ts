'use server'
import { redirect } from 'next/navigation'
import { writeTopic } from '@/agent/actions/write-topic'
import { Author } from '@/types'

export type WriteTopicState = {
    message: string
    topicId?: string
    error?: string
}

export async function writeTopicAction(
    prevState: WriteTopicState,
    formData: FormData
): Promise<WriteTopicState> {
    let topicId: string;

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

        topicId = await writeTopic(author, author.model)

    } catch (error) {
        console.error('Error writing topic:', error)
        return {
            message: 'Failed to write topic',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }

    redirect(`/topics/${topicId}`)
    return {
        message: 'Topic written successfully',
        topicId,
        error: ''
    }
} 