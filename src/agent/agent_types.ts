import { Author, Model } from "@/types";

export type FunctionDefinition = {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required?: string[];
    };
};

export type FunctionCallResult = {
    functionName: string;
    parameters: Record<string, any>;
};

export interface AgentAction {
    (author: Author, model: Model, ...args: any[]): Promise<string>
}