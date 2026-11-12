import { Author, Model } from "@/types";

export interface AgentAction {
    (author: Author, model: Model, ...args: any[]): Promise<any>
}