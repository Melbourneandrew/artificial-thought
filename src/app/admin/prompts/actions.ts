'use server'

import { updatePromptByKey } from '@/utils/repository/PromptRepo'
import { requireAdmin } from '@/utils/require-admin'
import { revalidatePath } from 'next/cache'

export async function updatePrompt(promptKey: string, newPrompt: string) {
    await requireAdmin()
    await updatePromptByKey(promptKey, newPrompt)
    revalidatePath('/admin/prompts')
    return { success: true }
}
