import { type NextRequest } from "next/server"
import { authorizeAdmin } from "@/utils/access"

export async function proxy(request: NextRequest) {
    const denied = await authorizeAdmin(request)
    if (denied) return denied
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
}
