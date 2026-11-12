export function isDevAccessBypass(env: Record<string, string | undefined>): boolean {
    return env.NODE_ENV === "development" && env.CF_ACCESS_DEV_BYPASS === "true"
}

export function isPlaceholderAccessConfig(teamDomain: string, aud: string): boolean {
    const domain = teamDomain.trim()
    const audience = aud.trim()
    if (!domain || !audience) return true
    if (domain.includes("your-team.cloudflareaccess.com")) return true
    if (audience.startsWith("replace-with")) return true
    return false
}
