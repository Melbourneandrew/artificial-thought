'use client'

import { useActionState } from 'react'
import { scheduleTopic } from './actions'

interface ScheduleTopicModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ScheduleTopicModal({ isOpen, onClose }: ScheduleTopicModalProps) {
    const initialState = { success: false, error: null }
    const [state, formAction, pending] = useActionState(scheduleTopic, initialState)

    // Close modal and reload page when submission is successful
    if (state.success && isOpen) {
        onClose()
        window.location.reload()
    }

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Schedule New Topic</h3>

                <form action={formAction} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Topic Title</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter topic title"
                            className="input input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Created By</span>
                        </label>
                        <input
                            type="text"
                            name="created_by_user_name"
                            placeholder="Enter your name"
                            className="input input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Publish Date</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="published_at"
                            className="input input-bordered w-full"
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                    </div>

                    {state.error && (
                        <div className="text-error text-sm">{state.error}</div>
                    )}

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={pending}
                        >
                            {pending ? 'Scheduling...' : 'Schedule Topic'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    )
} 