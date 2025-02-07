import { createClient } from '@/utils/supabase/server'
import { PromptCard } from './PromptCard'

export default async function PromptsPage() {
    const supabase = await createClient()

    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .order('prompt_key')

    if (error) {
        console.error('Error fetching prompts:', error)
        return <div className="p-4">Error loading prompts</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Prompts</h1>
            <div className="space-y-6">
                {prompts?.map((prompt) => (
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
