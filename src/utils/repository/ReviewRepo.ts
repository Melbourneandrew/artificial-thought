import { createClient } from '@/utils/supabase/server'
import { Review } from '@/types'

export async function createReview(review: {
    essay_id: string;
    author_id: string;
    content: string;
}): Promise<Review> {
    const supabase = await createClient()

    const { data: newReview, error } = await supabase
        .from('reviews')
        .insert([review])
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            essay:essays (
                id,
                title,
                description,
                content
            )
        `)
        .single()

    if (error) throw error
    return newReview as Review
}

export async function getReviewById(id: string): Promise<Review | null> {
    const supabase = await createClient()

    const { data: review, error } = await supabase
        .from('reviews')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            essay:essays (
                id,
                title,
                description,
                content
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching review:', error)
        return null
    }

    return review as Review
}

export async function getReviewByEssayAndAuthor(essayId: string, authorId: string): Promise<Review | null> {
    const supabase = await createClient()

    const { data: review, error } = await supabase
        .from('reviews')
        .select(`
            *,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url
            ),
            essay:essays (
                id,
                title,
                description,
                content
            )
        `)
        .eq('essay_id', essayId)
        .eq('author_id', authorId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('Error fetching review:', error)
        return null
    }

    return review as Review
}
