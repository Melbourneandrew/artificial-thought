import { TopicsList } from './TopicsList'
import { ScheduleTopicModal } from './ScheduleTopicModal'
import { ScheduleTopicButton } from './ScheduleTopicButton'
import { getUserCreatedTopics } from '@/utils/repository/TopicRepo'

export default async function ScheduleTopicsPage() {
    const topics = await getUserCreatedTopics()
    console.log('topics from page', topics)

    return (
        <div className="container mx-auto mt-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Scheduled Topics</h1>
                <ScheduleTopicButton />
            </div>
            <TopicsList initialTopics={topics} initialError={null} />
            <ScheduleTopicModal />
        </div>
    )
}
