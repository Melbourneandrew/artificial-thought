import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"
import { NextResponse, type NextRequest } from "next/server"
import { isDevAccessBypass, isPlaceholderAccessConfig } from "@/utils/access-policy"

const jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export function accessIssuer(teamDomain: string): string {
    const host = teamDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
    return `https://${host}`
}

function jwks(issuer: string) {
    const existing = jwksByIssuer.get(issuer)
    if (existing) return existing
    const set = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))
    jwksByIssuer.set(issuer, set)
    return set
}

export function readAccessToken(requestHeaders: Headers): string | null {
    const header = requestHeaders.get("cf-access-jwt-assertion")
    if (header) return header
    const cookie = requestHeaders.get("cookie") || ""
    for (const part of cookie.split(";")) {
        const trimmed = part.trim()
        if (trimmed.startsWith("CF_Authorization=")) {
            return decodeURIComponent(trimmed.slice("CF_Authorization=".length))
        }
    }
    return null
}

export async function verifyAccessJwt(token: string, teamDomain: string, aud: string): Promise<JWTPayload> {
    const issuer = accessIssuer(teamDomain)
    const { payload } = await jwtVerify(token, jwks(issuer), {
        issuer,
        audience: aud,
    })
    return payload
}

function accessSettings() {
    return {
        teamDomain: process.env.CF_ACCESS_TEAM_DOMAIN || "",
        aud: process.env.CF_ACCESS_AUD || "",
    }
}

export async function authorizeAdmin(request: NextRequest): Promise<NextResponse | null> {
    if (isDevAccessBypass(process.env)) return null

    const token = readAccessToken(request.headers)
    const { teamDomain, aud } = accessSettings()
    if (!token || isPlaceholderAccessConfig(teamDomain, aud)) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        await verifyAccessJwt(token, teamDomain, aud)
        return null
    } catch (error) {
        console.error("Cloudflare Access JWT rejected", error)
        return new NextResponse("Unauthorized", { status: 401 })
    }
}

export async function assertAccessHeaders(headerList: Headers): Promise<void> {
    if (isDevAccessBypass(process.env)) return
    const token = readAccessToken(headerList)
    const { teamDomain, aud } = accessSettings()
    if (!token || isPlaceholderAccessConfig(teamDomain, aud)) {
        throw new Error("Unauthorized")
    }
    await verifyAccessJwt(token, teamDomain, aud)
}
