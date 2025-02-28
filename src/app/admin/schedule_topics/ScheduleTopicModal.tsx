'use client'

import { useActionState } from 'react'
import { scheduleTopic } from './actions'

function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function ScheduleTopicModal() {
    const initialState = { success: false, error: null }
    const [state, formAction, pending] = useActionState(scheduleTopic, initialState)

    // Close modal and reload page when submission is successful
    if (state.success) {
        (document.getElementById('schedule_topic_modal') as HTMLDialogElement)?.close()
        window.location.reload()
    }

    return (
        <dialog id="schedule_topic_modal" className="modal">
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
                            <span className="label-text">Schedule For</span>
                        </label>
                        <input
                            type="date"
                            name="scheduled_for"
                            className="input input-bordered w-full"
                            min={formatDate(new Date())}
                            defaultValue={(() => {
                                const now = new Date()
                                if (now.getHours() < 8) {
                                    return formatDate(now)
                                }
                                const tomorrow = new Date(now)
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                return formatDate(tomorrow)
                            })()}
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
                            onClick={() => (document.getElementById('schedule_topic_modal') as HTMLDialogElement)?.close()}
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
                <button>close</button>
            </form>
        </dialog>
    )
} 