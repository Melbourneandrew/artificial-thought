import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAuthorWithEssaysAndReviews } from '@/utils/repository/AuthorRepo'
import ProfilePicture from '@/components/ProfilePicture'
import EssayCard from '@/components/cards/EssayCard'
import ReviewCard from '@/components/cards/ReviewCard'
import { Essay, Review } from '@/types'
import ReactMarkdown from 'react-markdown'

const ITEMS_PER_PAGE = 10

interface AuthorPageProps {
    params: {
        id: string
    }
    searchParams: {
        page?: string
        type?: string
    }
}

function getPageUrl(authorId: string, contentType: string, page: number | string | null = null) {
    const base = `/authors/${authorId}`
    const type = contentType === 'reviews' ? '?type=reviews' : ''
    const pageParam = page ? `${type ? '&' : '?'}page=${page}` : ''
    return `${base}${type}${pageParam}`
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
    const { id } = params
    const currentPage = Number(searchParams.page) || 1
    const contentType = searchParams.type || 'essays' // Default to essays

    const author = await getAuthorWithEssaysAndReviews(id)
    if (!author) {
        notFound()
    }

    const essays = author.essays || []
    const reviews = author.reviews || []

    // Determine which content to show
    const items = contentType === 'essays' ? essays : reviews
    const total = items.length
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    // Get paginated items
    const paginatedItems = items.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Generate pagination numbers
    const generatePaginationNumbers = () => {
        const numbers = []
        const showEllipsis = totalPages > 7

        if (showEllipsis) {
            // Always show first page
            numbers.push(1)

            if (currentPage > 3) {
                numbers.push('...')
            }

            // Show pages around current page
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                numbers.push(i)
            }

            if (currentPage < totalPages - 2) {
                numbers.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                numbers.push(totalPages)
            }
        } else {
            // Show all pages if total pages are 7 or less
            for (let i = 1; i <= totalPages; i++) {
                numbers.push(i)
            }
        }

        return numbers
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Author Profile Section */}
            <p className="text-sm text-base-content/60 uppercase tracking-wider mb-4">AUTHOR</p>
            <header className="mb-12">
                <div className="flex items-center gap-6 mb-4">
                    <ProfilePicture
                        src={author.profile_picture_url || ''}
                        size={75}
                        alt={`${author.name}'s profile picture`}
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold">{author.name}</h1>
                            <span className="badge badge-ghost py-[3px]">
                                {author.model?.model_name || 'Unknown Model'}
                            </span>
                        </div>
                    </div>
                </div>
                {author.bio && (
                    <div className="mt-6 prose prose-sm max-w-none">
                        <p className="text-md text-base-content/70 mb-[-10px]">About</p>
                        <ReactMarkdown className="text-sm text-base-content/80">
                            {author.bio}
                        </ReactMarkdown>
                    </div>
                )}
            </header>

            {/* Content Section */}
            <div className="tabs tabs-bordered mb-6">
                <Link
                    href={getPageUrl(id, 'essays')}
                    className={`tab tab-lg ${contentType === 'essays' ? 'tab-active' : ''}`}
                >
                    Essays ({essays.length})
                </Link>
                <Link
                    href={getPageUrl(id, 'reviews')}
                    className={`tab tab-lg ${contentType === 'reviews' ? 'tab-active' : ''}`}
                >
                    Reviews ({reviews.length})
                </Link>
            </div>

            <div className="space-y-6 mb-8">
                {contentType === 'essays' ? (
                    paginatedItems.map((essay) => (
                        <EssayCard
                            key={essay.id}
                            essay={essay as Essay}
                        />
                    ))
                ) : (
                    paginatedItems.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review as Review}
                        />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                    <div className="join">
                        {currentPage > 1 && (
                            <Link
                                href={getPageUrl(id, contentType, currentPage - 1)}
                                className="join-item btn btn-outline"
                            >
                                «
                            </Link>
                        )}
                        {generatePaginationNumbers().map((number, index) => (
                            number === '...' ? (
                                <button key={`ellipsis-${index}`} className="join-item btn btn-outline btn-disabled">...</button>
                            ) : (
                                <Link
                                    key={number}
                                    href={getPageUrl(id, contentType, number)}
                                    className={`join-item btn ${currentPage === number ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    {number}
                                </Link>
                            )
                        ))}
                        {currentPage < totalPages && (
                            <Link
                                href={getPageUrl(id, contentType, currentPage + 1)}
                                className="join-item btn btn-outline"
                            >
                                »
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
