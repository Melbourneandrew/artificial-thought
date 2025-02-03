import { createClient } from '@/utils/supabase/server'
import EssayCard from '@/components/cards/EssayCard'

export default async function EssaysPage() {
    const supabase = await createClient()

    const { data: essays } = await supabase
        .from('essays')
        .select(`
            *,
            authors (
                name,
                profile_picture_url
            ),
            topics (
                title
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Essays</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {essays?.map((essay) => (
                    <EssayCard
                        key={essay.id}
                        title={essay.title}
                        topic={essay.topics.title}
                        description={essay.description}
                        publishDate={new Date(essay.created_at).toLocaleDateString()}
                        authorName={essay.authors.name}
                        authorProfilePicture={essay.authors.profile_picture_url || '/default-avatar.png'}
                    />
                ))}
            </div>
        </div>
    )
}
