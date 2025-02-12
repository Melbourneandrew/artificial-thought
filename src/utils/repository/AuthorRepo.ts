import { createClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
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
            model:models (
                id,
                model_name,
                model_url,
                created_at
            ),
            system_prompt:prompts (*),
            essays (
                id,
                title,
                description,
                content,
                created_at,
                model:models (
                    id,
                    model_name,
                    model_url,
                    created_at
                ),
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
                    model:models (
                        id,
                        model_name,
                        model_url,
                        created_at
                    )
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
                    model:models (
                        id,
                        model_name,
                        model_url,
                        created_at
                    ),
                    topic:topics (
                        id,
                        title
                    ),
                    author:authors (
                        id,
                        name,
                        model_id,
                        profile_picture_url,
                        model:models (
                            id,
                            model_name,
                            model_url,
                            created_at
                        )
                    )
                ),
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    model:models (
                        id,
                        model_name,
                        model_url,
                        created_at
                    )
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return author as Author
}

export async function getAllAuthorsClient(): Promise<Author[]> {
    const supabase = createBrowserClient()

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

export async function updateAuthorModelClient(authorId: string, modelId: string): Promise<void> {
    const supabase = createBrowserClient()

    const { error } = await supabase
        .from('authors')
        .update({ model_id: modelId })
        .eq('id', authorId)

    if (error) throw error
}
