import TopicCard from '@/components/cards/TopicCard'
import { getPublishedTopics } from '@/utils/repository/TopicRepo'
import Link from 'next/link'

const TOPICS_PER_PAGE = 10

export default async function TopicsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams
    const currentPage = Number(page) || 1
    const { topics, total } = await getPublishedTopics(currentPage, TOPICS_PER_PAGE)

    const totalPages = Math.ceil(total / TOPICS_PER_PAGE)

    // Generate pagination numbers
    const generatePaginationNumbers = () => {
        const numbers: (number | string)[] = []
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
            numbers.push(totalPages)
        } else {
            // Show all pages if total pages are 7 or less
            for (let i = 1; i <= totalPages; i++) {
                numbers.push(i)
            }
        }

        return numbers
    }

    // Group topics by date
    const groupedTopics = topics.reduce((groups, topic) => {
        const date = topic.published_at
            ? new Date(topic.published_at).toISOString().split('T')[0]
            : 'Draft'

        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(topic)
        return groups
    }, {} as Record<string, typeof topics>)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Topics</h1>
            <div className="flex flex-col gap-6">
                {Object.entries(groupedTopics).map(([date, topics]) => (
                    <div key={date}>
                        <h2 className="text-lg font-medium text-gray-500 mb-4">
                            {date !== 'Draft' ? new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Draft'}
                        </h2>
                        <div className="flex flex-col gap-6">
                            {topics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                    <div className="join">
                        {currentPage > 1 && (
                            <Link
                                href={`/topics?page=${currentPage - 1}`}
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
                                    href={`/topics?page=${number}`}
                                    className={`join-item btn ${currentPage === number ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    {number}
                                </Link>
                            )
                        ))}
                        {currentPage < totalPages && (
                            <Link
                                href={`/topics?page=${currentPage + 1}`}
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
