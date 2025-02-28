'use client'

import { useState } from 'react'
import { ScheduleTopicModal } from './ScheduleTopicModal'
import TopicCard from '@/components/cards/TopicCard'
import { Topic } from '@/types'

interface TopicsListProps {
    initialTopics: Topic[]
    initialError: string | null
}

export function TopicsList({ initialTopics, initialError }: TopicsListProps) {
    const [topics] = useState<Topic[]>(initialTopics)
    const [error] = useState<string | null>(initialError)

    const now = new Date()
    const futureTopics = topics
        .filter(topic => !topic.published_at || new Date(topic.published_at) > now)
        .sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at) : new Date(8640000000000000)
            const dateB = b.published_at ? new Date(b.published_at) : new Date(8640000000000000)
            return dateA.getTime() - dateB.getTime()
        })

    const pastTopics = topics
        .filter(topic => topic.published_at && new Date(topic.published_at) <= now)
        .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())

    return (
        <div className="p-4">
            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Future Scheduled Topics</h2>
                    <div className="flex flex-col gap-4">
                        {futureTopics.map((topic) => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                showDelete={true}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Past Scheduled Topics</h2>
                    <div className="flex flex-col gap-4">
                        {pastTopics.map((topic) => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                showDelete={true}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <ScheduleTopicModal />
        </div>
    )
} 