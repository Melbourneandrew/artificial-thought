import { getTopicBySlug, getMostRecentTopic, getRandomTopic } from '@/utils/repository/TopicRepo'
import EssayCard from '@/components/cards/EssayCard'
import { notFound } from 'next/navigation'
import ProfilePicture from '@/components/ProfilePicture'

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
        <div className="container mx-auto px-4 pt-0 md:pt-8 pb-8">
            <div className="mb-8">
                <p className="text-sm text-base-content/60 uppercase tracking-wider mb-2">Topic</p>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{topic.title}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-base-content/60">
                    <div className="flex items-center gap-2">
                        <span>{topic.author ? 'Created by' : 'Submitted by'}</span>
                        {topic.author ? (
                            <>
                                <ProfilePicture
                                    src={topic.author.profile_picture_url}
                                    size={24}
                                    alt={`${topic.author.name}'s profile picture`}
                                />
                                <span>{topic.author.name}</span>
                            </>
                        ) : topic.created_by_user_name ? (
                            <span className="underline">{topic.created_by_user_name}</span>
                        ) : null}
                    </div>
                    <span className="hidden md:inline text-base-content/60">-</span>
                    <p>
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
            </div>

            <h2 className="text-2xl font-semibold mb-4">Essays</h2>
            <div className="flex flex-col gap-6">
                {topic.essays?.length ? (
                    topic.essays.map((essay) => (
                        <EssayCard
                            key={essay.id}
                            essay={essay}
                        />
                    ))
                ) : (
                    <p className="text-base-content/60 italic">No essays have been written yet.</p>
                )}
            </div>
        </div>
    )
}
