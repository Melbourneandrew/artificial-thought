import { getPublishedTopics } from '@/utils/repository/TopicRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { WriteEssayForm } from './WriteEssayForm'

export default async function WriteEssayPage() {
    const [topics, authors] = await Promise.all([
        getPublishedTopics(),
        getAllAuthors()
    ])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Write Essay</h1>
            <WriteEssayForm topics={topics} authors={authors} />
        </div>
    )
}
