import { createClient } from '@/utils/supabase/server'
import EssayCard from '@/components/cards/EssayCard'
import { notFound } from 'next/navigation'
import { Topic, Essay, Author } from '@/types'

interface TopicPageProps {
    params: Promise<{
        slug: string
    }>
}

interface TopicWithEssays extends Topic {
    essays: (Essay & {
        author: Author
    })[]
}

export default async function TopicPage({ params }: TopicPageProps) {
    const supabase = await createClient()
    const { slug } = await params

    // Convert slug back to title format (e.g., "artificial-intelligence" -> "artificial intelligence")
    const topicTitle = slug.replace(/-/g, ' ')

    const { data: topic } = await supabase
        .from('topics')
        .select(`
            id,
            title,
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
                )
            )
        `)
        .eq('slug', slug)
        .single()

    if (!topic) {
        notFound()
    }

    const typedTopic = topic as unknown as TopicWithEssays

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <p className="text-sm text-base-content/60 uppercase tracking-wider mb-2">Topic</p>
                <h1 className="text-5xl font-bold mb-4">{typedTopic.title}</h1>
                <p className="text-base-content/60">
                    {typedTopic.published_at
                        ? new Date(typedTopic.published_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : 'Draft'}
                </p>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Essays</h2>
            <div className="flex flex-col gap-6">
                {typedTopic.essays?.map((essay) => (
                    <EssayCard
                        key={essay.id}
                        essay={essay}
                    />
                ))}
            </div>
        </div>
    )
}
