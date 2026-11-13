export const ACTIVE_AUTHOR_STATUS = "active"

/** SQL predicate for schedulers and task creation. Not user input. */
export const ACTIVE_AUTHOR_PREDICATE = "status = 'active'"

export function isSchedulableAuthor(status: string | null | undefined): boolean {
    return status === ACTIVE_AUTHOR_STATUS
}

export function isListedAuthor(author: { status?: string | null; essay_count?: number | null }): boolean {
    if (author.status === "retired" && (author.essay_count ?? 0) === 0) return false
    return true
}
