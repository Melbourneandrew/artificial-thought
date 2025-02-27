'use client'

import { Model } from '@/types'
import { useActionState } from 'react'
import { handleDeleteModel } from './actions'
import { useEffect } from 'react'

interface DeleteModelModalProps {
    isOpen: boolean
    selectedModel: Model | null
    onClose: () => void
}

export default function DeleteModelModal({
    isOpen,
    selectedModel,
    onClose
}: DeleteModelModalProps) {
    const [deleteState, deleteAction, pending] = useActionState(handleDeleteModel, { loading: false, error: '' })

    useEffect(() => {
        if (!pending && !deleteState.error && deleteState.loading === false) {
            onClose()
        }
    }, [deleteState, pending])

    if (!selectedModel) return null

    return (
        <dialog open={isOpen} className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">Confirm Delete</h3>
                <p>Are you sure you want to delete {selectedModel.model_name}?</p>
                <form action={async (formData: FormData) => {
                    await deleteAction(formData)
                }}>
                    {deleteState?.error && (
                        <div className="alert alert-error mt-4">
                            <span>{deleteState.error}</span>
                        </div>
                    )}
                    <input type="hidden" name="id" value={selectedModel.id} />
                    <div className="modal-action">
                        <button
                            type="submit"
                            className="btn btn-error"
                            disabled={pending}
                        >
                            {pending && <span className="loading loading-spinner"></span>}
                            {pending ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            disabled={pending}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
} 