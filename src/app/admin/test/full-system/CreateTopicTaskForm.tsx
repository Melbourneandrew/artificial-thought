'use client'

import { useActionState } from 'react'
import { Author } from '@/types'
import { createTopicTaskAction, CreateTopicTaskState } from './actions'

interface CreateTopicTaskFormProps {
    authors: Author[]
}

const initialState: CreateTopicTaskState = {
    message: ''
}

export function CreateTopicTaskForm({ authors }: CreateTopicTaskFormProps) {
    const [state, formAction, pending] = useActionState(createTopicTaskAction, initialState)

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
                    {pending ? 'Creating Task...' : 'Create Topic Task'}
                </button>
            </div>
        </form>
    )
} 