'use client'

import { useActionState } from 'react'
import { Author, Essay } from '@/types'
import { writeReviewAction, WriteReviewState } from './actions'

interface WriteReviewFormProps {
    essays: Essay[]
    authors: Author[]
}

const initialState: WriteReviewState = {
    message: ''
}

export function WriteReviewForm({ essays, authors }: WriteReviewFormProps) {
    const [state, formAction, pending] = useActionState(writeReviewAction, initialState)

    return (
        <form action={formAction}>
            <div className="space-y-6">
                {/* Author Selection */}
                <div className="form-control w-full">
                    <label className="label" htmlFor="authorId">
                        <span className="label-text">Select Author</span>
                    </label>
                    <select
                        id="authorId"
                        name="authorId"
                        className="select select-bordered w-full"
                        required
                        onChange={(e) => {
                            // When author is selected, store the full author data
                            const author = authors.find(a => a.id === e.target.value)
                            if (author) {
                                const input = document.createElement('input')
                                input.type = 'hidden'
                                input.name = 'authorData'
                                input.value = JSON.stringify(author)
                                e.target.form?.appendChild(input)
                            }
                        }}
                    >
                        <option value="">Select an author...</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name} ({author.model?.model_name})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Essay Selection */}
                <div className="form-control w-full">
                    <label className="label" htmlFor="essayId">
                        <span className="label-text">Select Essay</span>
                    </label>
                    <select
                        id="essayId"
                        name="essayId"
                        className="select select-bordered w-full"
                        required
                        onChange={(e) => {
                            // When essay is selected, store the full essay data
                            const essay = essays.find(t => t.id === e.target.value)
                            if (essay) {
                                const input = document.createElement('input')
                                input.type = 'hidden'
                                input.name = 'essayData'
                                input.value = JSON.stringify(essay)
                                e.target.form?.appendChild(input)
                            }
                        }}
                    >
                        <option value="">Select an essay...</option>
                        {essays.map((essay) => (
                            <option key={essay.id} value={essay.id}>
                                {essay.title} (by {essay.author.name})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Error Message */}
                {state?.error && (
                    <div className="alert alert-error">
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Status Message */}
                {state?.message && !state.error && (
                    <div className="alert alert-info">
                        <span>{state.message}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={pending}
                >
                    {pending ? 'Writing Review...' : 'Write Review'}
                </button>
            </div>
        </form>
    )
} 