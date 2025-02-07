import { getRandomEssay, getUnreviewedEssay } from '@/utils/repository/EssayRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { reviewEssay } from '@/agent/actions/review-essay'
import { getReviewById, getReviewByEssayAndAuthor } from '@/utils/repository/ReviewRepo'
import ReviewCard from '@/components/cards/ReviewCard'

export default async function TestReviewEssay() {
    console.log('🤖 Fetching available authors...')
    const authors = await getAllAuthors()
    const gpt4Author = authors.find(author => author.model?.model_name.includes('gpt-4'))
    if (!gpt4Author) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>No GPT-4 author found</span>
                </div>
            </div>
        )
    }
    console.log('🎭 Selected author:', gpt4Author)

    console.log('🎲 Fetching unreviewed essay...')
    const essay = await getUnreviewedEssay(gpt4Author.id)
    if (!essay) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-warning">
                    <span>No unreviewed essays available - this author has reviewed all essays!</span>
                </div>
            </div>
        )
    }
    console.log('📝 Selected essay:', essay)

    // Start review generation
    console.log('✍️ Starting review generation...')
    const reviewId = await reviewEssay(gpt4Author, gpt4Author.model!, essay.id)
    console.log('📎 Review created with ID:', reviewId)

    console.log('📥 Fetching generated review...')
    const review = await getReviewById(reviewId)
    if (!review) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>Failed to fetch generated review</span>
                </div>
            </div>
        )
    }

    console.log('✅ Review fetched successfully:', {
        id: review.id,
        length: review.content.length
    })

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Essay Review Test</h1>

            <div className="space-y-8">
                <div className="bg-base-200 p-6 rounded-lg prose max-w-none">
                    <h2 className="text-xl font-bold">Original Essay</h2>
                    <h3>{essay.title}</h3>
                    <p className="text-gray-600 italic">{essay.description}</p>
                    <div className="whitespace-pre-wrap">{essay.content}</div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Generated Review</h2>
                    <ReviewCard review={{
                        ...review,
                        essay: {
                            ...essay,
                            author: essay.author
                        }
                    }} />
                </div>
            </div>
        </div>
    )
} 