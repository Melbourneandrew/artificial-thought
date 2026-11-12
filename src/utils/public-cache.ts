const PUBLIC_EXACT = new Set(["/", "/about", "/essays", "/topics", "/authors"])

export function isCacheablePublicPath(pathname: string): boolean {
    if (pathname.startsWith("/admin") || pathname.startsWith("/_next")) return false
    if (PUBLIC_EXACT.has(pathname)) return true
    if (pathname.startsWith("/essays/")) return true
    if (pathname.startsWith("/topics/")) return true
    if (pathname.startsWith("/authors/")) return true
    return false
}

export function isCacheablePublicGet(request: Request): boolean {
    if (request.method !== "GET") return false
    const url = new URL(request.url)
    return isCacheablePublicPath(url.pathname)
}

export function publicCacheKey(request: Request, version: string): Request {
    const url = new URL(request.url)
    url.searchParams.set("__cv", version || "0")
    return new Request(url.toString(), { method: "GET" })
}
