import { all, one, run } from "@/utils/db"
import { newId, nowIso } from "@/utils/ids"
import { Model } from "@/types"

export async function getAllModels(): Promise<Model[]> {
    return all<Model>(`SELECT id, model_name, model_url, created_at FROM models ORDER BY model_name`)
}

export async function createModel(model: Pick<Model, "model_name" | "model_url">): Promise<Model> {
    const created: Model = {
        id: newId(),
        model_name: model.model_name,
        model_url: model.model_url,
        created_at: nowIso(),
    }
    await run(
        `INSERT INTO models (id, model_name, model_url, created_at) VALUES (?, ?, ?, ?)`,
        created.id,
        created.model_name,
        created.model_url,
        created.created_at,
    )
    return created
}

export async function deleteModel(id: string): Promise<void> {
    await run(`DELETE FROM models WHERE id = ?`, id)
}

export async function updateModelUrl(id: string, modelUrl: string): Promise<Model> {
    await run(`UPDATE models SET model_url = ? WHERE id = ?`, modelUrl, id)
    const updated = await one<Model>(`SELECT id, model_name, model_url, created_at FROM models WHERE id = ?`, id)
    if (!updated) throw new Error("Failed to update model")
    return updated
}
