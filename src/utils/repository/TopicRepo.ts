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
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            author:authors!created_by_author_id (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            essay_authors:essays!inner (
                distinct_on: author_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                )
            ),
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

export async function getPreviousTopics(n: number = 5): Promise<Topic[]> {
    const supabase = await createClient()

    const { data: topics, error } = await supabase
        .from('topics')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(n)

    if (error) throw error
    if (!topics) return []

    return topics as Topic[]
}

export async function getTopicBySlug(slug: string): Promise<TopicWithEssays | null> {
    const supabase = await createClient()

    const { data: topic, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            author:authors!created_by_author_id (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            essay_authors:essays!inner (
                distinct_on: author_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                )
            ),
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
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            author:authors!created_by_author_id (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            essay_authors:essays!inner (
                distinct_on: author_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                )
            ),
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

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove all non-word chars (except spaces and dashes)
        .replace(/\s+/g, '-')     // Replace spaces with dashes
        .replace(/-+/g, '-')      // Replace multiple dashes with single dash
        .replace(/^-+/, '')       // Trim dashes from start
        .replace(/-+$/, '');      // Trim dashes from end
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
    const supabase = await createClient()
    let slug = baseSlug
    let counter = 1

    while (true) {
        const { data, error } = await supabase
            .from('topics')
            .select('slug')
            .eq('slug', slug)
            .single()

        if (error?.code === 'PGRST116') {  // PGRST116 means no rows returned
            return slug
        }
        if (error) throw error

        // If we get here, the slug exists, so try the next number
        slug = `${baseSlug}-${counter}`
        counter++
    }
}

async function hasTopicOnDate(date: Date): Promise<boolean> {
    const supabase = await createClient()

    // Set time range for the entire day (from 00:00 to 23:59)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { count, error } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', startOfDay.toISOString())
        .lte('published_at', endOfDay.toISOString())

    if (error) throw error
    return (count ?? 0) > 0
}

export async function createTopic(params: Omit<Topic, 'id' | 'created_at' | 'slug'>): Promise<Topic> {
    const supabase = await createClient()

    if (params.published_at) {
        const publishDate = new Date(params.published_at)
        const hasExistingTopic = await hasTopicOnDate(publishDate)
    }

    const baseSlug = slugify(params.title)
    const slug = await getUniqueSlug(baseSlug)

    // Set published_at to 8am on the specified date if it exists
    let scheduledPublishAt = params.published_at
    if (scheduledPublishAt) {
        const date = new Date(scheduledPublishAt)
        date.setHours(8, 0, 0, 0)
        scheduledPublishAt = date.toISOString()
    }

    const { data: topic, error } = await supabase
        .from('topics')
        .insert({
            title: params.title,
            slug: slug,
            published_at: scheduledPublishAt,
            created_by_author_id: params.created_by_author_id,
            created_by_user_name: params.created_by_user_name
        })
        .select(`
            id,
            title,
            slug,
            published_at,
            created_at,
            created_by_author_id,
            created_by_user_name
        `)
        .single()

    if (error) throw error
    if (!topic) throw new Error('Failed to create topic')

    return topic
}

export async function getUserCreatedTopics(): Promise<Topic[]> {
    const supabase = await createClient()

    const { data: topics, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            essay_authors:essays (
                distinct_on: author_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                )
            )
        `)
        .is('created_by_author_id', null)
        .order('created_at', { ascending: false })

    if (error) throw error
    if (!topics) return []

    const transformedTopics = topics.map(topic => ({
        ...topic,
        essay_authors: (topic.essay_authors || []).map(ea => ea.author)
    }));

    return transformedTopics as unknown as Topic[]
}

export async function getPublishedTopics(): Promise<Topic[]> {
    const supabase = await createClient();

    const { data: topics, error } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            author:authors!created_by_author_id (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            essay_authors:essays!inner (
                distinct_on: author_id,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                )
            )
        `)
        .lte('published_at', new Date().toISOString())
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedTopics = topics?.map(topic => ({
        ...topic,
        essay_authors: topic.essay_authors.map(ea => ea.author)
    }));

    return transformedTopics as unknown as Topic[];
}