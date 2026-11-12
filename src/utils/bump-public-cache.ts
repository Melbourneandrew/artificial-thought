import { run } from "@/utils/db"

export async function bumpPublicCache(): Promise<void> {
    try {
        await run(
            `UPDATE app_meta SET value = CAST((CAST(value AS INTEGER) + 1) AS TEXT) WHERE key = 'public_cache'`,
        )
    } catch (error) {
        console.error("Failed to bump the public page cache", error)
    }
}
