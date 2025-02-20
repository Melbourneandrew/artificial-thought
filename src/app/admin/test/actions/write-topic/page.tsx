import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { WriteTopicForm } from './WriteTopicForm'

export default async function WriteTopicPage() {
    const authors = await getAllAuthors()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Write Topic</h1>
            <WriteTopicForm authors={authors} />
        </div>
    )
} 