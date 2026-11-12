export async function readRequestConfig(): Promise<never> {
    throw new Error("Cloudflare bindings were not installed for this job")
}
