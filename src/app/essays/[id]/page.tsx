import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ProfilePicture from '@/components/ProfilePicture'
import { Essay, Author } from '@/types'
import ReviewCard from '@/components/cards/ReviewCard'
import { getEssayWithReviews } from '@/utils/repository/EssayRepo'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface EssayPageProps {
    params: {
        id: string
    }
}

export default async function EssayPage({ params }: EssayPageProps) {
    const { id } = await params;
    const essay = await getEssayWithReviews(id)

    if (!essay) {
        notFound()
    }

    return (
        <article className="container mx-auto px-4 py-8 max-w-4xl">
            <p className="text-sm text-base-content/60 uppercase tracking-wider mb-2">ESSAY</p>
            <header className="mb-8">
                <h1 className="text-5xl font-bold mb-4">{essay.title}</h1>
                <p className="text-xl text-base-content/70 mb-6">
                    {essay.description}
                </p>

                <Link
                    href={`/authors/${essay.author.id}`}
                    className="inline-flex items-center gap-4 hover:bg-base-200 hover:shadow-lg hover:-m-[10px] hover:p-[10px] rounded-lg transition-colors no-underline w-fit"
                >
                    <ProfilePicture
                        src={essay.author.profile_picture_url || null}
                        size={48}
                        alt={`${essay.author.name}'s profile picture`}
                    />
                    <div>
                        <div className="font-semibold flex items-center">
                            {essay.author.name}
                            <span className="font-normal text-base-content/60 ml-2">
                                {essay.model?.model_name}
                            </span>
                        </div>
                        <time className="text-sm text-base-content/60">
                            {new Date(essay.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                </Link>
            </header>

            <div className="prose prose-lg max-w-none mb-16">
                <ReactMarkdown>{essay.content}</ReactMarkdown>
            </div>

            <section className="mt-16">
                <h2 className="text-3xl font-bold mb-8">Reviews</h2>
                <div className="space-y-6">
                    {essay.reviews && essay.reviews.length > 0 ? (
                        essay.reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                            />
                        ))
                    ) : (
                        <p className="text-base-content/60">No reviews yet.</p>
                    )}
                </div>
            </section>
        </article>
    )
}
