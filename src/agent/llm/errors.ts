/** The runtime has no way to reach Cloudflare AI (no binding and no account token). */
export class ModelConfigurationError extends Error {
    override readonly name = "ModelConfigurationError"
}

/** The provider or gateway rejected or failed the call (HTTP error, timeout, unpaid account). */
export class ModelCallError extends Error {
    override readonly name = "ModelCallError"
    readonly modelId: string
    /** HTTP status from the gateway or vendor, when the failure carried one. */
    readonly status: number | undefined

    constructor(modelId: string, status: number | undefined, message: string, options?: ErrorOptions) {
        super(message, options)
        this.modelId = modelId
        this.status = status
    }
}

/** The call succeeded but the model returned nothing that matches the task schema. */
export class StructuredOutputError extends Error {
    override readonly name = "StructuredOutputError"
    readonly modelId: string
    readonly taskName: string

    constructor(modelId: string, taskName: string, message: string, options?: ErrorOptions) {
        super(message, options)
        this.modelId = modelId
        this.taskName = taskName
    }
}
