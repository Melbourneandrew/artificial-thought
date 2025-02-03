import { createClient } from '@/utils/supabase/server'
import TopicCard from '@/components/cards/TopicCard'
import { Author, Essay } from '@/types'
export default async function TopicsPage() {
    const supabase = await createClient()

    const { data: topics } = await supabase
        .from('topics')
        .select(`
            title,
            published_at,
            created_at,
            essays (
                id,
                title,
                description,
                authors (
                    name,
                    profile_picture_url
                )
            )
        `)
        .order('created_at', { ascending: false })

    const formattedTopics = topics?.map(topic => ({
        topic: topic.title,
        releaseDate: topic.published_at ? new Date(topic.published_at).toLocaleDateString() : 'Draft',
        createdAt: new Date(topic.created_at),
        essays: topic.essays,
        authors: topic.essays?.flatMap(essay => essay.authors).map(author => ({
            name: author.name,
            profilePicture: author.profile_picture_url
        }))
    }))

    // Group topics by date
    const groupedTopics = formattedTopics?.reduce((groups, topic) => {
        const date = topic.createdAt.toLocaleDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(topic)
        return groups
    }, {} as Record<string, typeof formattedTopics>)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Topics</h1>
            <div className="flex flex-col gap-6">
                {groupedTopics && Object.entries(groupedTopics).map(([date, topics]) => (
                    <div key={date}>
                        <h2 className="text-2xl font-semibold mb-4">
                            {new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h2>
                        <div className="flex flex-col gap-6">
                            {topics.map((topic) => (
                                <TopicCard
                                    key={topic.topic}
                                    topic={topic.topic}
                                    releaseDate={topic.releaseDate}
                                    authors={topic.authors}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
