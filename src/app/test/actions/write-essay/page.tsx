import { getRandomTopic } from '@/utils/repository/TopicRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { writeEssay } from '@/agent/actions/write-essay'
import { getEssayById } from '@/utils/repository/EssayRepo'

export default async function TestActions() {
    console.log('🎲 Fetching random topic...')
    const topicData = await getRandomTopic()
    if (!topicData) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>No topics available</span>
                </div>
            </div>
        )
    }
    console.log('📝 Selected topic:', topicData)

    console.log('🤖 Fetching available authors...')
    const authors = await getAllAuthors()
    const gpt4Author = authors.find(author => author.model?.model_name.includes('gpt-4'))
    if (!gpt4Author) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>No GPT-4 author found</span>
                </div>
            </div>
        )
    }
    console.log('🎭 Selected author:', gpt4Author)

    console.log('✍️ Starting essay generation...')
    const essayId = await writeEssay(gpt4Author, gpt4Author.model!, topicData)
    console.log('📎 Essay created with ID:', essayId)

    console.log('📥 Fetching generated essay...')
    const essay = await getEssayById(essayId)
    if (!essay) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    <span>Failed to fetch generated essay</span>
                </div>
            </div>
        )
    }
    console.log('✅ Essay fetched successfully:', {
        title: essay.title,
        length: essay.content.length,
        description: essay.description
    })

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Generated Essay</h1>

            <div className="prose max-w-none">
                <h2>{essay.title}</h2>
                <p className="text-gray-600 italic">{essay.description}</p>
                <div className="whitespace-pre-wrap">{essay.content}</div>
            </div>
        </div>
    )
}
