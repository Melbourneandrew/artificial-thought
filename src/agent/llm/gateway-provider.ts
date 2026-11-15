import { createAI, type AI } from "agents/models/ai-sdk"
import { ModelConfigurationError } from "./errors.ts"

/** How the Worker reaches AI Gateway: the AI binding, or an account id and API token (local tools). */
export interface GatewayAccess {
    binding?: Ai
    accountId?: string
    apiToken?: string
    gatewayId: string
}

export function createGatewayProvider(access: GatewayAccess): AI {
    if (access.binding) return createAI({ binding: access.binding, id: access.gatewayId })
    if (access.accountId && access.apiToken) {
        return createAI({ accountId: access.accountId, apiToken: access.apiToken, id: access.gatewayId })
    }
    throw new ModelConfigurationError(
        "Cloudflare AI is not configured. Bind AI, set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN, or set LLM_MODE=mock for local development.",
    )
}
