import TopicCard from '@/components/cards/TopicCard'
import { getPublishedTopics } from '@/utils/repository/TopicRepo'

export default async function TopicsPage() {
    const topics = await getPublishedTopics()

    // Group topics by date
    const groupedTopics = topics.reduce((groups, topic) => {
        const date = topic.published_at
            ? new Date(topic.published_at).toISOString().split('T')[0]
            : 'Draft'

        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(topic)
        return groups
    }, {} as Record<string, typeof topics>)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Topics</h1>
            <div className="flex flex-col gap-6">
                {Object.entries(groupedTopics).map(([date, topics]) => (
                    <div key={date}>
                        <h2 className="text-lg font-medium text-gray-500 mb-4">
                            {date !== 'Draft' ? new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Draft'}
                        </h2>
                        <div className="flex flex-col gap-6">
                            {topics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
