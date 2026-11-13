'use client'

import { useActionState } from 'react'
import { Author } from '@/types'
import { handleRetireAndReplace } from './actions'

export default function RetireAuthorForm({ authors }: { authors: Author[] }) {
    const [state, action, pending] = useActionState(handleRetireAndReplace, { error: '' })

    return (
        <form action={action} className="card bg-base-100 shadow-lg">
            <div className="card-body gap-4">
                <h2 className="card-title">Retire and replace with a new model</h2>
                <p className="text-sm text-base-content/70">
                    The current author row keeps its essays and becomes retired. A new active author copies the persona, bio, and prompt, and writes with the new model.
                </p>
                {state.error && (
                    <div className="alert alert-error">
                        <span>{state.error}</span>
                    </div>
                )}
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Active author</span>
                    <select name="author_id" className="select" required defaultValue="">
                        <option value="" disabled>Choose an author</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name} ({author.model?.model_name || 'no model'})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">New author name</span>
                    <input name="author_name" className="input" placeholder="Same persona name if empty" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">New model name</span>
                    <input name="model_name" className="input" required placeholder="Claude Sonnet 6" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Cloudflare model id</span>
                    <input name="model_url" className="input" required placeholder="anthropic/claude-sonnet-6" />
                </label>
                <button type="submit" className="btn btn-primary w-fit" disabled={pending}>
                    {pending ? 'Retiring...' : 'Retire & replace with new model'}
                </button>
            </div>
        </form>
    )
}
