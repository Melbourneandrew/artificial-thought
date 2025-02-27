import { createClient } from '@/utils/supabase/server'
import { Essay } from '@/types'

export async function getAllEssays(page: number = 1, pageSize: number = 25): Promise<{
    essays: Essay[];
    total: number;
}> {
    const supabase = await createClient()

    // Calculate offset
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [{ count }, { data: essays, error }] = await Promise.all([
        // Get total count
        supabase
            .from('essays')
            .select('*', { count: 'exact', head: true }),
        // Get paginated essays
        supabase
            .from('essays')
            .select(`
                *,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url
                ),
                topic:topics (
                    id,
                    title,
                    slug
                )
            `)
            .order('created_at', { ascending: false })
            .range(from, to)
    ])

    if (error) throw error
    return {
        essays: essays as Essay[],
        total: count || 0
    }
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
                profile_picture_url,
                model:models (*)
            ),
            topic:topics (*),
            reviews (
                id,
                content,
                created_at,
                essay_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    model:models (*)
                ),
                essay:essays (
                    id,
                    title,
                    author:authors (
                        id,
                        name,
                        profile_picture_url,
                        model:models (*)
                    )
                )
            )
        `)
        .eq('id', id)
        .single()

    if (essayError) throw essayError

    return essay as Essay
}

export async function createEssay(essay: {
    title: string;
    description: string;
    content: string;
    topic_id: string;
    author_id: string;
    model_name: string;
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
