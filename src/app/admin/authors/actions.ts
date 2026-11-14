'use server'

import { revalidatePath } from 'next/cache'
import { retireAndReplace } from '@/utils/repository/AuthorRepo'
import { requireAdmin } from '@/utils/require-admin'

type ActionState = {
    error: string
}

export async function handleRetireAndReplace(_prev: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin()
    const authorId = String(formData.get('author_id') || '')
    const modelName = String(formData.get('model_name') || '')
    const modelUrl = String(formData.get('model_url') || '')
    const authorName = String(formData.get('author_name') || '')
    try {
        await retireAndReplace({
            authorId,
            modelName,
            modelUrl,
            authorName,
        })
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Could not switch the author to the new model' }
    }
    revalidatePath('/admin/authors')
    revalidatePath('/authors')
    return { error: '' }
}
