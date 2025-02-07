import { createClient } from '@/utils/supabase/server'
import { Essay } from '@/types'

export async function getAllEssays(): Promise<Essay[]> {
    const supabase = await createClient()

    const { data: essays, error } = await supabase
        .from('essays')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            model:models (
                id,
                model_name
            ),
            topic:topics (
                id,
                title,
                slug
            )
        `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return essays as Essay[]
}

export async function getEssayById(id: string): Promise<Essay | null> {
    const supabase = await createClient()

    const { data: essay, error } = await supabase
        .from('essays')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            model:models (
                id,
                model_name
            ),
            topic:topics (
                id,
                title,
                slug
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return essay as Essay
}

export async function getEssayWithReviews(id: string): Promise<Essay | null> {
    const supabase = await createClient()

    const { data: essay, error: essayError } = await supabase
        .from('essays')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            model:models (
                id,
                model_name
            ),
            topic:topics (
                id,
                title,
                slug
            ),
            reviews (
                id,
                content,
                created_at,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url
                )
            )
        `)
        .eq('id', id)
        .single()

    if (essayError) throw essayError

    return essay as unknown as Essay;
}
