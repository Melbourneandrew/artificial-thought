import { getTopicBySlug, getMostRecentTopic, getRandomTopic } from '@/utils/repository/TopicRepo'
import EssayCard from '@/components/cards/EssayCard'
import { notFound } from 'next/navigation'

interface TopicPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function TopicPage({ params }: TopicPageProps) {
    const { slug } = await params

    const topic = slug === 'today'
        ? await getMostRecentTopic()
        : slug === 'random'
            ? await getRandomTopic()
            : await getTopicBySlug(slug)

    if (!topic) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <p className="text-sm text-base-content/60 uppercase tracking-wider mb-2">Topic</p>
                <h1 className="text-5xl font-bold mb-4">{topic.title}</h1>
                <p className="text-base-content/60">
                    {topic.published_at
                        ? new Date(topic.published_at).toLocaleDateString('en-US', {
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
                {topic.essays?.map((essay) => (
                    <EssayCard
                        key={essay.id}
                        essay={essay}
                    />
                ))}
            </div>
        </div>
    )
}
