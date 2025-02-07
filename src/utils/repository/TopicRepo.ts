import { createClient } from '@/utils/supabase/server'
import { Topic, Essay, Author } from '@/types'

interface TopicWithEssays extends Topic {
    essays: (Essay & {
        author: Author
    })[]
}

export async function getMostRecentTopic(): Promise<TopicWithEssays | null> {
    const supabase = await createClient()

    const { data: topic, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            published_at,
            created_at,
            essays (
                id,
                title,
                description,
                created_at,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                ),
                topic:topics (
                    id,
                    title,
                    slug,
                    published_at,
                    created_at
                )
            )
        `)
        .order('published_at', { ascending: false })
        .not('published_at', 'is', null)
        .limit(1)
        .single()

    if (error) throw error
    if (!topic) return null

    return topic as unknown as TopicWithEssays
}

export async function getTopicBySlug(slug: string): Promise<TopicWithEssays | null> {
    const supabase = await createClient()

    const { data: topic, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            published_at,
            created_at,
            essays (
                id,
                title,
                description,
                created_at,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                ),
                topic:topics (
                    id,
                    title,
                    slug,
                    published_at,
                    created_at
                )
            )
        `)
        .eq('slug', slug)
        .single()

    if (error) throw error
    if (!topic) return null

    return topic as unknown as TopicWithEssays
}

export async function getRandomTopic(): Promise<TopicWithEssays | null> {
    const supabase = await createClient()

    const { count } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .not('published_at', 'is', null)

    if (!count) return null

    const randomOffset = Math.floor(Math.random() * count)

    const { data: topic, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            published_at,
            created_at,
            essays (
                id,
                title,
                description,
                created_at,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                ),
                topic:topics (
                    id,
                    title,
                    slug,
                    published_at,
                    created_at
                )
            )
        `)
        .not('published_at', 'is', null)
        .limit(1)
        .range(randomOffset, randomOffset)
        .single()

    if (error) throw error
    if (!topic) return null

    return topic as unknown as TopicWithEssays
}
