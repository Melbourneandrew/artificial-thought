import { getAllEssays } from '@/utils/repository/EssayRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { WriteReviewForm } from './WriteReviewForm'

export default async function WriteReviewPage() {
    const [{ essays }, authors] = await Promise.all([
        getAllEssays(1, 25), // Get first 25 essays
        getAllAuthors()
    ])

    // Add validation
    if (!Array.isArray(essays) || !Array.isArray(authors)) {
        console.error('Invalid data format:', { essays, authors })
        return <div className="alert alert-error">Error loading data</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Write Review</h1>
            <WriteReviewForm essays={essays} authors={authors} />
        </div>
    )
} 