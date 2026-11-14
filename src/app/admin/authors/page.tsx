import { getActiveAuthors, getAllAuthors } from '@/utils/repository/AuthorRepo'
import { isListedAuthor } from '@/utils/author-status'
import RetireAuthorForm from './RetireAuthorForm'

export const dynamic = "force-dynamic"

export default async function ManageAuthorsPage() {
    const [active, all] = await Promise.all([getActiveAuthors(), getAllAuthors()])
    // Retired rows with no essays have nothing to show, so they are hidden here too.
    const retired = all.filter((author) => author.status === 'retired' && isListedAuthor(author))

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Authors</h1>
            <RetireAuthorForm authors={active} />
            <h2 className="text-xl font-semibold mt-10 mb-4">Retired</h2>
            {retired.length === 0 ? (
                <p className="text-base-content/70">No retired authors.</p>
            ) : (
                <ul className="space-y-2">
                    {retired.map((author) => (
                        <li key={author.id} className="flex flex-wrap gap-2 items-baseline">
                            <span className="font-medium">{author.name}</span>
                            <span className="badge badge-ghost">{author.model?.model_name || 'Unknown model'}</span>
                            <span className="text-sm text-base-content/60">{author.essay_count ?? 0} essays</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
