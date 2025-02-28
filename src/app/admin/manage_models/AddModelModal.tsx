'use client'

import { useActionState } from 'react'
import { handleCreateModel } from './actions'

export default function AddModelModal() {
    const [createState, createAction, pending] = useActionState(handleCreateModel, { loading: false, error: '' })

    return (
        <dialog id="add-model-modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Add New Model</h3>
                <form action={async (formData: FormData) => {
                    await createAction(formData)
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
                            className="btn btn-primary w-[100px]"
                            disabled={pending}
                        >
                            {pending && <span className="loading loading-spinner"></span>}
                            {pending ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            disabled={pending}
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