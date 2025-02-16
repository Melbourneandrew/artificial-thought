'use server'

import { createTopic } from '@/utils/repository/TopicRepo'
import { revalidatePath } from 'next/cache'
import { getUserCreatedTopics } from '@/utils/repository/TopicRepo'
import { Topic } from '@/types'
export type ActionState = {
    success: boolean
    error: null | string
}

export async function scheduleTopic(
    state: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const publishDate = formData.get('published_at')
        if (!publishDate) {
            return { success: false, error: 'Publish date is required' }
        }

        await createTopic({
            title: formData.get('title') as string,
            created_by_user_name: formData.get('created_by_user_name') as string,
            created_by_author_id: null,
            published_at: new Date(publishDate as string).toISOString()
        })

        revalidatePath('/admin/schedule_topics')
        return { success: true, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to schedule topic'
        // Check specifically for the duplicate date error
        if (errorMessage === 'A topic is already scheduled for this date') {
            return {
                success: false,
                error: 'A topic is already scheduled for this date. Please choose a different date.'
            }
        }
        return { success: false, error: errorMessage }
    }
}