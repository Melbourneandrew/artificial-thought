import { headers } from "next/headers"
import { assertAccessHeaders } from "@/utils/access"

export async function requireAdmin(): Promise<void> {
    await assertAccessHeaders(await headers())
}
