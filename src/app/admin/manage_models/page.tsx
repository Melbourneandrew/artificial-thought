import { getAllAuthors } from '@/utils/repository/AuthorRepo'
import { getAllModels } from '@/utils/repository/ModelRepo'
import ModelsManager from './ModelsManager'

export default async function ManageModelsPage() {
    const [models, authors] = await Promise.all([
        getAllModels(),
        getAllAuthors(),
    ])

    return <ModelsManager models={models} authors={authors} />
}
