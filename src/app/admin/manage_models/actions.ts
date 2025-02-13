'use server'

import { revalidatePath } from 'next/cache'
import { createModel, updateModel, deleteModel } from '@/utils/repository/ModelRepo'
import { createClient } from '@/utils/supabase/server'

type ActionState = {
    loading: boolean;
    error: string;
}

export async function handleCreateModel(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
        const id = formData.get('id') as string
        const model_name = formData.get('model_name') as string
        const model_url = formData.get('model_url') as string
        // Get all selected author IDs from checkboxes
        const author_ids = formData.getAll('author_ids').map(id => id.toString())

        if (!id || !model_name || !model_url) {
            return { loading: false, error: 'Missing required fields' }
        }

        // Update model details
        await updateModel(id, { model_name, model_url })

        // Update author assignments
        const supabase = await createClient()

        // First, unassign all authors from this model
        const { error: unassignError } = await supabase
            .from('authors')
            .update({ model_id: null })
            .eq('model_id', id)

        if (unassignError) {
            console.error('Unassign error:', unassignError)
            throw unassignError
        }

        // Then, assign the selected authors to this model (only if there are selected authors)
        if (author_ids.length > 0) {
            const { error: assignError } = await supabase
                .from('authors')
                .update({ model_id: id })
                .in('id', author_ids)

            if (assignError) {
                console.error('Assign error:', assignError)
                throw assignError
            }
        }

        revalidatePath('/admin/manage_models')
        return { loading: false, error: '' }
    } catch (error) {
        console.error('Edit model error:', error)
        return { loading: false, error: 'Failed to update model' }
    }
}

export async function handleDeleteModel(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
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
