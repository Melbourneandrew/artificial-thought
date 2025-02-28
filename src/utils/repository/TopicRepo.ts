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

    const { data: topic } = await supabase
        .from('topics')
        .select(`
            id,
            title,
            slug,
            created_by_author_id,
            created_by_user_name,
            published_at,
            created_at,
            author:authors (
                id,
                name,
                model_id,
                profile_picture_url,
                created_at
            ),
            essay_authors:essays (
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
            author:authors (
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
        const { error } = await supabase
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

export async function createTopic(params: Omit<Topic, 'id' | 'created_at' | 'slug'>): Promise<Topic> {
    const supabase = await createClient()

    const baseSlug = slugify(params.title)
    const slug = await getUniqueSlug(baseSlug)

    const { data: topic, error } = await supabase
        .from('topics')
        .insert({
            title: params.title,
            slug: slug,
            published_at: params.published_at,
            scheduled_for: params.scheduled_for,
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

export async function getPublishedTopics(page: number = 1, pageSize: number = 25): Promise<{
    topics: Topic[];
    total: number;
}> {
    const supabase = await createClient();

    // Calculate offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ count }, { data: topics, error }] = await Promise.all([
        // Get total count
        supabase
            .from('topics')
            .select('*', { count: 'exact', head: true })
            .not('published_at', 'is', null),
        // Get paginated topics
        supabase
            .from('topics')
            .select(`
                id,
                title,
                slug,
                created_by_author_id,
                created_by_user_name,
                published_at,
                created_at,
                author:authors (
                    id,
                    name,
                    model_id,
                    profile_picture_url,
                    created_at
                ),
                essay_authors:essays!topic_id (
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
            .not('published_at', 'is', null)
            .order('published_at', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, to)
    ]);

    if (error) throw error;

    const transformedTopics = (topics || []).map(topic => ({
        ...topic,
        essay_authors: (topic.essay_authors || []).map(ea => ea.author)
    }));

    return {
        topics: transformedTopics as unknown as Topic[],
        total: count || 0
    };
}

export async function getTopicById(id: string): Promise<Topic | null> {
    const supabase = await createClient()

    const { data: topic, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    if (!topic) return null

    return topic
}

export async function getScheduledTopic(date: Date = new Date()): Promise<Topic | null> {
    const supabase = await createClient()

    // Get current date in local timezone (e.g., America/New_York)
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        .toISOString()
        .split('T')[0] // Gets YYYY-MM-DD in local time
    console.log(today)

    const { data: topic } = await supabase
        .from('topics')
        .select('*')
        .eq('scheduled_for::date', today)
        .is('published_at', null)
        .single()

    if (!topic) return null

    return topic
}

export async function publishScheduledTopic(topic: Topic): Promise<Topic> {
    const supabase = await createClient()

    const { data: updatedTopic, error } = await supabase
        .from('topics')
        .update({
            published_at: new Date().toISOString()
        })
        .eq('id', topic.id)
        .select()
        .single()

    if (error) throw error
    if (!updatedTopic) throw new Error('Failed to publish topic')

    return updatedTopic
}