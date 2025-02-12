'use client'

import { Model } from '@/types'
import { useActionState } from 'react'
import { handleCreateModel } from './actions'
import { useRouter } from 'next/navigation'

interface AddModelModalProps { }

export default function AddModelModal() {
    const router = useRouter()
    const [createState, createAction] = useActionState(handleCreateModel, { loading: false, error: '' })

    return (
        <dialog id="add-model-modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Add New Model</h3>
                <form action={async (formData: FormData) => {
                    createAction(formData)
                    if (!createState.error) {
                        window.location.reload();
                        (document.getElementById('add-model-modal') as HTMLDialogElement).close();
                    }
                }}>
                    {createState?.error && (
                        <div className="alert alert-error mb-4">
                            <span>{createState.error}</span>
                        </div>
                    )}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Model Name</span>
                        </label>
                        <input type="text" name="model_name" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Model URL</span>
                        </label>
                        <input type="text" name="model_url" className="input input-bordered" required />
                    </div>
                    <div className="modal-action">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createState?.loading}
                        >
                            {createState?.loading && <span className="loading loading-spinner"></span>}
                            {createState?.loading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            disabled={createState?.loading}
                            onClick={() => {
                                (document.getElementById('add-model-modal') as HTMLDialogElement).close()
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
} 