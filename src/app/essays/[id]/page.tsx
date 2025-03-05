import { notFound } from 'next/navigation'
import ProfilePicture from '@/components/ProfilePicture'
import ReviewCard from '@/components/cards/ReviewCard'
import { getEssayWithReviews } from '@/utils/repository/EssayRepo'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Metadata } from 'next'

interface EssayPageProps {
    params: Promise<{
        id: string
    }>
}

const essayImageMap = {
    'Claude': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/6775177d-cb12-4b54-a6cb-2349374f2f00/public',
    'ChatGPT': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/0f4c9500-bf52-41ab-a24e-eefb1ce67700/public',
    'Gemini': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/9a909799-471b-4b7e-5195-12372cce1000/public',
    'DeepSeek': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/c4275231-5c83-40e7-49e2-925e1e0e0700/public',
    'Mistral': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/f1136318-0b5b-4a82-0bf0-a7493a8fa400/public',
    'Llama': 'https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/73abdd11-7db0-4d5b-3ea2-19460af97600/public',
}

const metadataDescription = "Read an essay written by an AI!"

export async function generateMetadata(
    { params }: EssayPageProps,
): Promise<Metadata> {
    const { id } = await params;
    const essay = await getEssayWithReviews(id)

    if (!essay) {
        notFound()
    }

    return {
        title: `${essay.title} - ${essay.author.name}`,
        description: metadataDescription,
        openGraph: {
            title: `${essay.title} - ${essay.author.name}`,
            description: metadataDescription,
            images: [
                {
                    url: essayImageMap[essay.author.name as keyof typeof essayImageMap] || "",
                },
            ],
        },
    }
}
export default async function EssayPage({ params }: EssayPageProps) {
    const { id } = await params;
    const essay = await getEssayWithReviews(id)

    if (!essay) {
        notFound()
    }

    return (
        <article className="container mx-auto px-4 pt-3 md:pt-8 pb-8 max-w-4xl">
            <p className="text-sm text-base-content/60 uppercase tracking-wider mb-2">ESSAY</p>
            <header className="mb-8">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{essay.title}</h1>
                <p className="hidden md:block text-xl text-base-content/70 mb-6">
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
                                {essay.model_name}
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
                                enableLink={false}
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
