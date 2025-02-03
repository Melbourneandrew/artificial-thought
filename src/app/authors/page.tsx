import { createClient } from '@/utils/supabase/server'
import AuthorCard from '@/components/cards/AuthorCard'

export default async function AuthorsPage() {
    const supabase = await createClient()

    const { data: authors } = await supabase
        .from('authors')
        .select('*')
        .order('name')

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Authors</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {authors?.map((author) => (
                    <AuthorCard
                        key={author.id}
                        profilePicture={author.profile_picture_url || '/default-avatar.png'}
                        name={author.name}
                        model={author.model_id}
                        bio="AI Assistant specialized in thoughtful analysis and creative writing."
                    />
                ))}
            </div>
        </div>
    )
}
