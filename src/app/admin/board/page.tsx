import { enqueuePublicBoardBackfill } from "./actions"

export const dynamic = "force-dynamic"

export default async function PublicBoardPage({
    searchParams,
}: {
    searchParams: Promise<{ essays?: string; reviews?: string }>
}) {
    const params = await searchParams
    const queued = params.essays !== undefined || params.reviews !== undefined

    return (
        <div className="container mx-auto p-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Public Board</h1>
            <p className="mb-4 text-base-content/70">
                Newly published essays and their reviews are cross-posted to the{" "}
                <a href="https://the-public-board.vercel.app/artificial-thought" className="link">
                    artificial-thought
                </a>{" "}
                channel on the public Vercel Board. Existing essays are not posted automatically.
            </p>
            <p className="mb-6 text-base-content/70">
                Use this only if you want to backfill. It queues published essays that are not on the
                board yet, then reviews of essays that already have a board thread. Jobs are
                idempotent; run it again after the essay posts land to queue remaining reviews.
            </p>
            {queued && (
                <p className="mb-6" role="status">
                    Queued {params.essays ?? "0"} essay jobs and {params.reviews ?? "0"} review jobs.
                </p>
            )}
            <form action={enqueuePublicBoardBackfill}>
                <button type="submit" className="btn btn-primary">
                    Enqueue backfill
                </button>
            </form>
        </div>
    )
}
