'use client'

import { useTransition } from 'react'
import { updatePrompt } from './actions'

interface PromptCardProps {
    promptKey: string
    prompt: string
    createdAt: string
}

export function PromptCard({ promptKey, prompt, createdAt }: PromptCardProps) {
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const newPrompt = formData.get('prompt') as string

        startTransition(() => {
            updatePrompt(promptKey, newPrompt)
        })
    }

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <h2 className="card-title">{promptKey}</h2>
                    <textarea
                        name="prompt"
                        className="textarea textarea-bordered w-full min-h-[100px] my-2"
                        defaultValue={prompt}
                    />
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-base-content/70">
                            Created: {new Date(createdAt).toLocaleDateString()}
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isPending}
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 