import EssayCard from '@/components/cards/EssayCard'
import { getAllEssays } from '@/utils/repository/EssayRepo'
import Link from 'next/link'

const ESSAYS_PER_PAGE = 25

export default async function EssaysPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams
    const currentPage = Number(page) || 1
    const { essays, total } = await getAllEssays(currentPage, ESSAYS_PER_PAGE)

    const totalPages = Math.ceil(total / ESSAYS_PER_PAGE)

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Essays</h1>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {essays?.map((essay) => (
                    <div key={essay.id} className="break-inside-avoid mb-6">
                        <EssayCard essay={essay} />
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                    <div className="join">
                        {currentPage > 1 && (
                            <Link
                                href={`/essays?page=${currentPage - 1}`}
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
                                    href={`/essays?page=${number}`}
                                    className={`join-item btn  ${currentPage === number ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    {number}
                                </Link>
                            )
                        ))}
                        {currentPage < totalPages && (
                            <Link
                                href={`/essays?page=${currentPage + 1}`}
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
