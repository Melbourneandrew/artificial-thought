'use client'

import { useActionState } from 'react'
import { Author, Topic } from '@/types'
import { writeEssayAction, WriteEssayState } from './actions'

interface WriteEssayFormProps {
    topics: Topic[]
    authors: Author[]
}

const initialState: WriteEssayState = {
    message: ''
}

export function WriteEssayForm({ topics, authors }: WriteEssayFormProps) {
    const [state, formAction, pending] = useActionState(writeEssayAction, initialState)
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

                {/* Topic Selection */}
                <div className="form-control w-full">
                    <label className="label" htmlFor="topicId">
                        <span className="label-text">Select Topic</span>
                    </label>
                    <select
                        id="topicId"
                        name="topicId"
                        className="select select-bordered w-full"
                        required
                        onChange={(e) => {
                            // When topic is selected, store the full topic data
                            const topic = topics.find(t => t.id === e.target.value)
                            if (topic) {
                                const input = document.createElement('input')
                                input.type = 'hidden'
                                input.name = 'topicData'
                                input.value = JSON.stringify(topic)
                                e.target.form?.appendChild(input)
                            }
                        }}
                    >
                        <option value="">Select a topic...</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.title}
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
                    {pending ? 'Writing Essay...' : 'Write Essay'}
                </button>
            </div>
        </form>
    )
} 