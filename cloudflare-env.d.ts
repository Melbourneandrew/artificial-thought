/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
    DB: D1Database
    TASK_QUEUE: Queue
    AI: Ai
    ASSETS: Fetcher
    CLOUDFLARE_ACCOUNT_ID?: string
    CLOUDFLARE_AI_GATEWAY_ID?: string
    CLOUDFLARE_API_TOKEN?: string
    LLM_MODE?: string
    CF_ACCESS_TEAM_DOMAIN?: string
    CF_ACCESS_AUD?: string
    CF_ACCESS_DEV_BYPASS?: string
    NEXT_PUBLIC_URL?: string
}
