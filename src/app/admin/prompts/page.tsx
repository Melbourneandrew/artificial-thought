import { listPrompts } from '@/utils/repository/PromptRepo'
import { PromptCard } from './PromptCard'

export default async function PromptsPage() {
    const prompts = await listPrompts()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Prompts</h1>
            <div className="space-y-6">
                {prompts.map((prompt) => (
                    <PromptCard
                        key={prompt.prompt_key}
                        promptKey={prompt.prompt_key}
                        prompt={prompt.prompt}
                        createdAt={prompt.created_at}
                    />
                ))}
            </div>
        </div>
    )
}
