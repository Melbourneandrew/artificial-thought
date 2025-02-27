import { redirect } from 'next/navigation'
import { getTopicById } from '@/utils/repository/TopicRepo'

export default async function TopicIdPage({
    params: { id },
}: {
    params: { id: string }
}) {
    const topic = await getTopicById(id)

    if (!topic) {
        redirect('/404')
    }

    redirect(`/topics/${topic.slug}`)
}
