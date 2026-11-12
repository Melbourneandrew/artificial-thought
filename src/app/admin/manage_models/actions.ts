'use server'

import { revalidatePath } from 'next/cache'
import { createModel, deleteModel, updateModelUrl } from '@/utils/repository/ModelRepo'
import { setModelAuthors } from '@/utils/repository/AuthorRepo'
import { requireAdmin } from '@/utils/require-admin'

type ActionState = {
    loading: boolean;
    error: string;
}

export async function handleCreateModel(prevState: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin()
    const model_name = formData.get('model_name') as string
    const model_url = formData.get('model_url') as string

    const trimmedModelName = model_name.trim()
    const trimmedModelUrl = model_url.trim()

    if (!trimmedModelName || !trimmedModelUrl) {
        return { loading: false, error: 'Model name and URL are required' }
    }

    await createModel({ model_name: trimmedModelName, model_url: trimmedModelUrl })
    revalidatePath('/admin/manage_models')
    return { loading: false, error: '' }
}

export async function handleEditModel(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await requireAdmin()
        const id = formData.get('id') as string
        const model_url = formData.get('model_url') as string
        const author_ids = formData.getAll('author_ids').map(authorId => authorId.toString())
        const trimmedModelUrl = model_url.trim()

        if (!id || !trimmedModelUrl) {
            return { loading: false, error: 'Missing required fields' }
        }

        await updateModelUrl(id, trimmedModelUrl)

        if (author_ids.length === 0) {
            return {
                loading: false,
                error: 'At least one author must be assigned to the model'
            }
        }

        await setModelAuthors(id, author_ids)
        revalidatePath('/admin/manage_models')
        return { loading: false, error: '' }
    } catch (error) {
        console.error('Edit model error:', error)
        return { loading: false, error: 'Failed to update model' }
    }
}

export async function handleDeleteModel(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await requireAdmin()
        const id = formData.get('id') as string
        await deleteModel(id)
        revalidatePath('/admin/manage_models')
        return { loading: false, error: '' }
    } catch (error) {
        console.error('Delete model error:', error)
        return {
            loading: false,
            error: 'Unable to delete model. It may be referenced by other records.'
        }
    }
}
