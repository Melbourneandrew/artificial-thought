import { getAllModels } from '@/utils/repository/ModelRepo'
import TestProvidersClient from './TestProvidersClient'
import { Model } from '@/types'

export default async function TestProvidersPage() {
    const models = await getAllModels()

    const modelsByUrl = models.reduce((acc, model) => {
        const url = model.model_url
        if (!acc[url]) {
            acc[url] = []
        }
        acc[url].push(model)
        return acc
    }, {} as Record<string, Model[]>)

    return (
        <div className="container mx-auto p-4">
            <TestProvidersClient modelsByUrl={modelsByUrl} />
        </div>
    )
}
