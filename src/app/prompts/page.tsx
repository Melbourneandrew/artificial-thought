import { createClient } from '@/utils/supabase/server'

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
                    <div key={prompt.prompt_key} className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title">{prompt.prompt_key}</h2>
                            <p className="whitespace-pre-wrap">{prompt.prompt}</p>
                            <div className="text-sm text-base-content/70">
                                Created: {new Date(prompt.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
