'use client'

import { useState, useEffect } from 'react'
import { ScheduleTopicModal } from './ScheduleTopicModal'
import CalendarIcon from '@/components/icons/CalendarIcon'
import TopicCard from '@/components/cards/TopicCard'
import { getUserCreatedTopicsList } from './actions'
import { Topic } from '@/types'

export default function ScheduleTopicsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [error, setError] = useState<string | null>(null)

    const fetchTopics = async () => {
        const response = await getUserCreatedTopicsList()
        console.log(response)
        if (response.success) {
            setTopics(response.data || [])
        } else {
            setError(response.error)
        }
    }

    useEffect(() => {
        fetchTopics()
    }, [])

    return (
        <div className="p-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary mb-4"
                >
                    Schedule New Topic
                    <CalendarIcon />
                </button>
            </div>

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

            <ScheduleTopicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
