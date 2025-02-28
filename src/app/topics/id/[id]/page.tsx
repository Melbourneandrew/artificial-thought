import { redirect } from 'next/navigation'
import { getTopicById } from '@/utils/repository/TopicRepo'

export default async function TopicIdPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const topic = await getTopicById(id)

    if (!topic) {
        redirect('/404')
    }

    redirect(`/topics/${topic.slug}`)
}
