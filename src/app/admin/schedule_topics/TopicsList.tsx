'use client'

import { useState } from 'react'
import { ScheduleTopicModal } from './ScheduleTopicModal'
import CalendarIcon from '@/components/icons/CalendarIcon'
import TopicCard from '@/components/cards/TopicCard'
import { Topic } from '@/types'

interface TopicsListProps {
    initialTopics: Topic[]
    initialError: string | null
}

export function TopicsList({ initialTopics, initialError }: TopicsListProps) {
    const [topics, setTopics] = useState<Topic[]>(initialTopics)
    const [error, setError] = useState<string | null>(initialError)

    return (
        <div className="p-4">

            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4">
                {topics.map((topic, index) => (
                    <TopicCard
                        key={index}
                        topic={topic}
                    />
                ))}
            </div>

            <ScheduleTopicModal />
        </div>
    )
} 