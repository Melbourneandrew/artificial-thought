'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePrompt(promptKey: string, newPrompt: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('prompts')
        .update({ prompt: newPrompt })
        .eq('prompt_key', promptKey)

    if (error) {
        throw error
    }

    revalidatePath('/prompts')
    return { success: true }
} 