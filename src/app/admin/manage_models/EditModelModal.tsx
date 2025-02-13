'use client'

import { Model, Author } from '@/types'
import { useActionState } from 'react'
import { handleEditModel } from './actions'
import { useRouter } from 'next/navigation'

interface EditModelModalProps {
    isOpen: boolean
    selectedModel: Model | null
    authors: Author[]
    onClose: () => void
}

export default function EditModelModal({
    isOpen,
    selectedModel,
    authors,
    onClose
}: EditModelModalProps) {
    const router = useRouter()
    const [editState, editAction] = useActionState(handleEditModel, { loading: false, error: '' })

    if (!selectedModel) return null

    return (
        <dialog open={isOpen} className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box overflow-visible">
                <h3 className="font-bold text-lg">Edit Model</h3>
                <form action={async (formData: FormData) => {
                    editAction(formData)
                    if (!editState.error) {
                        window.location.reload()
                        onClose()
                    }
                }}>
                    {editState?.error && (
                        <div className="alert alert-error mb-4">
                            <span>{editState.error}</span>
                        </div>
                    )}
                    <input type="hidden" name="id" value={selectedModel.id} />

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Model Name</span>
                        </label>
                        <input
                            type="text"
                            name="model_name"
                            defaultValue={selectedModel.model_name}
                            className="input input-bordered"
                            required
                            disabled
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Model URL</span>
                        </label>
                        <input
                            type="text"
                            name="model_url"
                            defaultValue={selectedModel.model_url}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control mt-4">
                        <label className="label">
                            <span className="label-text">Assign Authors</span>
                        </label>
                        <div className="bg-base-200 rounded-lg p-2 max-h-[12rem] overflow-y-auto">
                            {authors.map(author => (
                                <label key={author.id} className="flex items-center gap-2 p-2 hover:bg-base-300 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="author_ids"
                                        value={author.id}
                                        className="checkbox checkbox-sm"
                                        defaultChecked={author.model_id === selectedModel.id}
                                    />
                                    <span>{author.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-action">
                        <button
                            type="submit"
                            className="btn btn-primary w-[100px]"
                            disabled={editState?.loading}
                        >
                            {editState?.loading && <span className="loading loading-spinner"></span>}
                            {editState?.loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            className="btn"
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