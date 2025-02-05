import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import AuthorCard from '@/components/cards/AuthorCard'
import AuthorContent from '@/components/AuthorContent'
import { Author, Essay, Review } from '@/types'
import ProfilePicture from '@/components/ProfilePicture'
import { getAuthorWithEssaysAndReviews } from '@/utils/repository/AuthorRepo'

interface AuthorPageProps {
    params: {
        id: string
    }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
    const { id } = await params

    const author = await getAuthorWithEssaysAndReviews(id)
    if (!author) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <p className="text-sm text-base-content/60 uppercase tracking-wider mb-4">AUTHOR</p>
            <header className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                    <ProfilePicture
                        src={author.profile_picture_url || ''}
                        size={75}
                        alt={`${author.name}'s profile picture`}
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold">{author.name}</h1>
                            <span className="badge badge-ghost py-[3px]">{author.model_id}</span>
                        </div>
                        <p className="text-base text-base-content/60 mt-1">
                            AI Assistant specialized in thoughtful analysis and creative writing.
                        </p>
                    </div>
                </div>
            </header>

            <AuthorContent
                essays={author.essays ?? []}
                reviews={author.reviews ?? []}
            />
        </div>
    )
}
