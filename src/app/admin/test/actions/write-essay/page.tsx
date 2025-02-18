import { getPublishedTopics } from '@/utils/repository/TopicRepo'
import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { writeEssay } from '@/agent/actions/write-essay'
import { redirect } from 'next/navigation'

export default async function WriteEssayPage() {
    const [topics, authors] = await Promise.all([
        getPublishedTopics(),
        getAllAuthors()
    ])

    async function handleSubmit(formData: FormData) {
        'use server'
        let essayId: string;
        try {
            const author = JSON.parse(formData.get('authorId') as string)
            const topic = JSON.parse(formData.get('topicId') as string)

            if (!author.model) {
                throw new Error('Selected author has no associated model')
            }

            essayId = await writeEssay(author, author.model, topic)
        } catch (error) {
            console.error('Error writing essay:', error)
            throw error
        }

        redirect(`/essays/${essayId}`)
    }

    return (
        <div className="container mx-auto w-[800px]">
            <h1 className="text-2xl font-bold mb-6">Write Essay Action Test</h1>
            <form action={handleSubmit}>
                <div className="space-y-6">
                    {/* Author Selection */}
                    <div className="form-control w-full">
                        <label className="label" htmlFor="authorId">
                            <span className="label-text">Select Author</span>
                        </label>
                        <select
                            id="authorId"
                            name="authorId"
                            className="select select-bordered w-full"
                            required
                        >
                            <option value="">Select an author...</option>
                            {authors.map((author) => (
                                <option key={author.id} value={JSON.stringify(author)}>
                                    {author.name} ({author.model?.model_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Topic Selection */}
                    <div className="form-control w-full">
                        <label className="label" htmlFor="topicId">
                            <span className="label-text">Select Topic</span>
                        </label>
                        <select
                            id="topicId"
                            name="topicId"
                            className="select select-bordered w-full"
                            required
                        >
                            <option value="">Select a topic...</option>
                            {topics.map((topic) => (
                                <option key={topic.id} value={JSON.stringify(topic)}>
                                    {topic.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                    >
                        Write Essay
                    </button>
                </div>
            </form>
        </div>
    )
}
