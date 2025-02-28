'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Model, Author } from '@/types'
import AddModelModal from './AddModelModal'
import EditModelModal from './EditModelModal'
import DeleteModelModal from './DeleteModelModal'

export default function ManageModelsPage() {
    const [models, setModels] = useState<Model[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    async function loadData() {
        try {
            const [{ data: models, error: modelsError }, { data: authors, error: authorsError }] = await Promise.all([
                supabase
                    .from('models')
                    .select('*')
                    .order('model_name'),
                supabase
                    .from('authors')
                    .select(`
                        *,
                        model:models (*)
                    `)
                    .order('name')
            ])

            if (modelsError) throw modelsError
            if (authorsError) throw authorsError

            setModels(models || [])
            setAuthors(authors || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <div className="container mx-auto p-4">


            {/* Add Model Button */}
            <div className="flex mb-4">
                <h1 className="text-2xl font-bold mb-6">Manage Models</h1>
                <button
                    className="btn btn-primary ml-auto"
                    onClick={() => (document.getElementById('add-model-modal') as HTMLDialogElement).showModal()}
                >
                    Add Model
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Models Table */}
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>URL</th>
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
                                    <td>{model.model_url}</td>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
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
