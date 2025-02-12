'use client'

import { Model } from '@/types'
import { useActionState } from 'react'
import { handleDeleteModel } from './actions'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()
    const [deleteState, deleteAction] = useActionState(handleDeleteModel, { loading: false, error: '' })

    if (!selectedModel) return null

    return (
        <dialog open={isOpen} className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">Confirm Delete</h3>
                <p>Are you sure you want to delete {selectedModel.model_name}?</p>
                <form action={async (formData: FormData) => {
                    deleteAction(formData)
                    if (!deleteState.error) {
                        onClose()
                        window.location.reload()
                    }
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
                            disabled={deleteState?.loading}
                        >
                            {deleteState?.loading && <span className="loading loading-spinner"></span>}
                            {deleteState?.loading ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            disabled={deleteState?.loading}
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