"use server"

import { redirect } from "next/navigation"
import { enqueueBoardBackfill } from "@/integrations/public-board"
import { requireAdmin } from "@/utils/require-admin"

export async function enqueuePublicBoardBackfill(): Promise<void> {
    await requireAdmin()
    const result = await enqueueBoardBackfill()
    redirect(`/admin/board?essays=${result.essays}&reviews=${result.reviews}`)
}
