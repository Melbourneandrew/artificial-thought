'use server'
import { redirect } from 'next/navigation'
import { reviewEssay } from '@/agent/actions/review-essay'
import { Author, Essay } from '@/types'

export type WriteReviewState = {
    message: string
    reviewId?: string
    error?: string
}

export async function writeReviewAction(
    prevState: WriteReviewState,
    formData: FormData
): Promise<WriteReviewState> {
    let reviewId: string;
    let essay: Essay;

    try {
        const authorId = formData.get('authorId') as string
        const essayId = formData.get('essayId') as string

        if (!authorId || !essayId) {
            return {
                message: 'Please select both an author and an essay',
                error: 'Missing required fields'
            }
        }

        // Get the full author and essay objects from the form data
        const author = JSON.parse(formData.get('authorData') as string) as Author
        essay = JSON.parse(formData.get('essayData') as string) as Essay

        if (!author.model) {
            return {
                message: 'Selected author has no associated model',
                error: 'Invalid author configuration'
            }
        }

        reviewId = await reviewEssay(author, author.model, essay.id)

    } catch (error) {
        console.error('Error writing review:', error)
        return {
            message: 'Failed to write review',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }

    redirect(`/essays/${essay.id}`)
    return {
        message: 'Review written successfully',
        reviewId,
        error: ''
    }
} 