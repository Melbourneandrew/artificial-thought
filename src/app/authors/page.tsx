import AuthorCard from '@/components/cards/AuthorCard'
import { isListedAuthor } from '@/utils/author-status'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'

export const dynamic = "force-dynamic"

export default async function AuthorsPage() {
    const authors = (await getAllAuthors()).filter(isListedAuthor)
    const active = authors.filter((author) => author.status !== 'retired')
    const retired = authors.filter((author) => author.status === 'retired')

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Authors</h1>
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Active authors</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {active.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </section>
            {retired.length > 0 && (
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Retired authors</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {retired.map((author) => (
                            <AuthorCard key={author.id} author={author} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
