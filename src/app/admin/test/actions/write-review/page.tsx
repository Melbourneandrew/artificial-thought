import { getAllEssays } from '@/utils/repository/EssayRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { WriteReviewForm } from './WriteReviewForm'

export default async function WriteReviewPage() {
    const [essays, authors] = await Promise.all([
        getAllEssays(),
        getAllAuthors()
    ])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Write Review</h1>
            <WriteReviewForm essays={essays} authors={authors} />
        </div>
    )
} 