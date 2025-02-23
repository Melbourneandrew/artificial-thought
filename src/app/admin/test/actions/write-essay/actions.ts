'use server'
import { redirect } from 'next/navigation'
import { writeEssay } from '@/agent/actions/write-essay'
import { Author, Topic } from '@/types'

export type WriteEssayState = {
    message: string
    essayId?: string
    error?: string
}

export async function writeEssayAction(
    prevState: WriteEssayState,
    formData: FormData
): Promise<WriteEssayState> {
    let essayId: string;

    try {
        const authorId = formData.get('authorId') as string
        const topicId = formData.get('topicId') as string

        if (!authorId || !topicId) {
            return {
                message: 'Please select both an author and a topic',
                error: 'Missing required fields'
            }
        }

        // Get the full author and topic objects from the form data
        const author = JSON.parse(formData.get('authorData') as string) as Author
        const topic = JSON.parse(formData.get('topicData') as string) as Topic

        if (!author.model) {
            return {
                message: 'Selected author has no associated model',
                error: 'Invalid author configuration'
            }
        }

        const essay = await writeEssay(author, author.model, topic)
        essayId = essay.id

    } catch (error) {
        console.error('Error writing essay:', error)
        return {
            message: 'Failed to write essay',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }


    redirect(`/essays/${essayId}`)
    return {
        message: 'Essay written successfully',
        essayId,
        error: ''
    }
} 