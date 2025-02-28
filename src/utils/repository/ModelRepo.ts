import { createClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { Model } from '@/types'

export async function getAllModels(): Promise<Model[]> {
    const supabase = await createClient()

    const { data: models, error } = await supabase
        .from('models')
        .select('*')
        .order('model_name')

    if (error) throw error
    return models
}

export async function createModel(model: Pick<Model, 'model_name' | 'model_url'>): Promise<Model> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('models')
        .insert([model])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteModel(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Client methods
export async function getAllModelsClient(): Promise<Model[]> {
    const supabase = createBrowserClient()

    const { data: models, error } = await supabase
        .from('models')
        .select('*')
        .order('model_name')

    if (error) throw error
    return models
}

export async function createModelClient(model: Pick<Model, 'model_name' | 'model_url'>): Promise<Model> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
        .from('models')
        .insert([model])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateModelClient(id: string, updates: Partial<Pick<Model, 'model_name' | 'model_url'>>): Promise<Model> {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
        .from('models')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteModelClient(id: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function updateModelUrl(id: string, model_url: string): Promise<Model> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('models')
        .update({ model_url })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
} 