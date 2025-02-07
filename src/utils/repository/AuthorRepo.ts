import { createClient } from '@/utils/supabase/server'
import { Author } from '@/types'

export async function getAllAuthors(): Promise<Author[]> {
    const supabase = await createClient()

    const { data: authors, error } = await supabase
        .from('authors')
        .select(`
            *,
            model:models (*),
            system_prompt:prompts (*)
        `)
        .order('name')

    if (error) throw error
    return authors
}

export async function getAuthorWithEssaysAndReviews(id: string): Promise<Author | null> {
    const supabase = await createClient()

    const { data: author, error } = await supabase
        .from('authors')
        .select(`
            *,
            model:models (*),
            system_prompt:prompts (*),
            essays (
                id,
                title,
                description,
                content,
                created_at,
                model:models (*),
                topic:topics (
                    id,
                    title,
                    slug,
                    published_at
                ),
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    model:models (*)
                )
            ),
            reviews (
                id,
                content,
                created_at,
                essay:essays (
                    id,
                    title,
                    description,
                    model:models (*),
                    topic:topics (
                        id,
                        title
                    ),
                    author:authors (
                        id,
                        name,
                        model_id,
                        profile_picture_url,
                        model:models (*)
                    )
                ),
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    model:models (*)
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return author as Author
}
