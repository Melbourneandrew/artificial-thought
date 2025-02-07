import { createClient } from '@/utils/supabase/server'
import { Prompt } from '@/types'

export async function getPromptByKey(promptKey: string): Promise<Prompt | null> {
    const supabase = await createClient()

    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('prompt_key', promptKey)
        .limit(1)

    if (error) throw error
    return prompts?.[0] || null
}

export async function updatePromptByKey(promptKey: string, newPrompt: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('prompts')
        .update({ prompt: newPrompt })
        .eq('prompt_key', promptKey)

    if (error) throw error
}
