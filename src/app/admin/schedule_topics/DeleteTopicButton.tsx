'use client'

import { useActionState } from 'react'
import { deleteTopic } from './actions'
import TrashIcon from '@/components/icons/TrashIcon'
import { Topic } from '@/types'

interface DeleteTopicButtonProps {
    topic: Topic
}

export function DeleteTopicButton({ topic }: DeleteTopicButtonProps) {
    const initialState = { success: false, error: null }
    const [state, formAction, pending] = useActionState(deleteTopic, initialState)

    // Reload page when deletion is successful
    if (state.success) {
        window.location.reload()
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="topicId" value={topic.id} />
            <button
                type="submit"
                className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white"
                disabled={pending}
                onClick={(e) => {
                    e.stopPropagation() // Prevent triggering the parent link
                    if (!confirm('Are you sure you want to delete this topic?')) {
                        e.preventDefault()
                    }
                }}
            >
                <TrashIcon />
            </button>
            {state.error && (
                <div className="text-error text-sm mt-2">{state.error}</div>
            )}
        </form>
    )
} 