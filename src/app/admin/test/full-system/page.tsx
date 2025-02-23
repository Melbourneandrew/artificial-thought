import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { CreateTopicTaskForm } from './CreateTopicTaskForm'

export default async function CreateTopicTaskPage() {
    const authors = await getAllAuthors()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Create Topic Task</h1>
            <CreateTopicTaskForm authors={authors} />
        </div>
    )
} 