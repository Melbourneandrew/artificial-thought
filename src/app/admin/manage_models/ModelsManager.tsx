'use client'

import { useState } from 'react'
import { Author, Model } from '@/types'
import AddModelModal from './AddModelModal'
import EditModelModal from './EditModelModal'
import DeleteModelModal from './DeleteModelModal'

export default function ModelsManager({ models, authors }: { models: Model[]; authors: Author[] }) {
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    return (
        <div className="container mx-auto p-4">
            <div className="flex mb-4">
                <h1 className="text-2xl font-bold mb-6">Manage Models</h1>
                <button
                    className="btn btn-primary ml-auto"
                    onClick={() => (document.getElementById('add-model-modal') as HTMLDialogElement).showModal()}
                >
                    Add Model
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Cloudflare model id</th>
                            <th>Assigned Authors</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model) => {
                            const assignedAuthors = authors.filter(author => author.model_id === model.id)
                            return (
                                <tr key={model.id}>
                                    <td>{model.model_name}</td>
                                    <td className="font-mono text-sm">{model.model_url}</td>
                                    <td>{assignedAuthors.map(author => author.name).join(', ')}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-info mr-2"
                                            onClick={() => {
                                                setSelectedModel(model)
                                                setIsEditModalOpen(true)
                                                setIsDeleteModalOpen(false)
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-error"
                                            onClick={() => {
                                                setSelectedModel(model)
                                                setIsDeleteModalOpen(true)
                                                setIsEditModalOpen(false)
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <EditModelModal
                isOpen={isEditModalOpen}
                selectedModel={selectedModel}
                authors={authors}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedModel(null)
                }}
            />

            <DeleteModelModal
                isOpen={isDeleteModalOpen}
                selectedModel={selectedModel}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedModel(null)
                }}
            />

            <AddModelModal />
        </div>
    )
}
