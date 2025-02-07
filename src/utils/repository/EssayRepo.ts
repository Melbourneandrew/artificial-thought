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

export async function createEssay(essay: {
    title: string;
    description: string;
    content: string;
    topic_id: string;
    author_id: string;
    model_id: string;
}): Promise<Essay> {
    const supabase = await createClient()

    const { data: newEssay, error } = await supabase
        .from('essays')
        .insert([essay])
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
        .single()

    if (error) throw error
    return newEssay as Essay
}

export async function getRandomEssay(): Promise<Essay | null> {
    const essays = await getAllEssays()

    if (essays.length === 0) {
        console.error('No essays available')
        return null
    }

    const randomIndex = Math.floor(Math.random() * essays.length)
    return essays[randomIndex]
}

export async function getUnreviewedEssay(authorId: string): Promise<Essay | null> {
    const supabase = await createClient()

    // First get all reviewed essay IDs for this author
    const { data: reviewedEssayIds } = await supabase
        .from('reviews')
        .select('essay_id')
        .eq('author_id', authorId)

    // Then get an essay that's not in that list
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

    // Filter out reviewed essays in JavaScript
    const reviewedIds = new Set((reviewedEssayIds || []).map(r => r.essay_id))
    const unreviewedEssay = essays.find(essay => !reviewedIds.has(essay.id))

    if (!unreviewedEssay) {
        return null
    }

    return unreviewedEssay as Essay
}
