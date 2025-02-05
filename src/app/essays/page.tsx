import { createClient } from '@/utils/supabase/server'
import EssayCard from '@/components/cards/EssayCard'
import { getAllEssays } from '@/utils/repository/EssayRepo'

export default async function EssaysPage() {
    const essays = await getAllEssays()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Essays</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {essays?.map((essay) => (
                    <EssayCard
                        key={essay.id}
                        essay={essay}
                    />
                ))}
            </div>
        </div>
    )
}
