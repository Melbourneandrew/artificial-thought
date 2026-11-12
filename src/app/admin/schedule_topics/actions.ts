'use server'

import { createTopic, deleteTopicById } from '@/utils/repository/TopicRepo'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/utils/require-admin'

export type ActionState = {
    success: boolean
    error: null | string
}

export async function scheduleTopic(
    state: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        await requireAdmin()
        const scheduleDate = formData.get('scheduled_for')
        if (!scheduleDate) {
            return { success: false, error: 'Schedule date is required' }
        }

        await createTopic({
            title: formData.get('title') as string,
            created_by_user_name: formData.get('created_by_user_name') as string,
            created_by_author_id: null,
            published_at: null,
            scheduled_for: new Date(scheduleDate as string).toISOString()
        })

        revalidatePath('/admin/schedule_topics')
        return { success: true, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to schedule topic'
        if (errorMessage === 'A topic is already scheduled for this date') {
            return {
                success: false,
                error: 'A topic is already scheduled for this date. Please choose a different date.'
            }
        }
        return { success: false, error: errorMessage }
    }
}

export async function deleteTopic(
    state: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        await requireAdmin()
        const topicId = formData.get('topicId') as string
        if (!topicId) {
            return { success: false, error: 'Topic ID is required' }
        }

        await deleteTopicById(topicId)
        revalidatePath('/admin/schedule_topics')
        return { success: true, error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete topic'
        return { success: false, error: errorMessage }
    }
}
