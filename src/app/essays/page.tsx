import { createClient } from '@/utils/supabase/server'
import EssayCard from '@/components/cards/EssayCard'
import { getAllEssays } from '@/utils/repository/EssayRepo'

export default async function EssaysPage() {
    const essays = await getAllEssays()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Essays</h1>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {essays?.map((essay) => (
                    <div key={essay.id} className="break-inside-avoid mb-6">
                        <EssayCard
                            essay={essay}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
