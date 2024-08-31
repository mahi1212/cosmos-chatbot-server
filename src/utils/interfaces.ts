export interface ISettingsInterface {
    _id: string;
    gpt_version?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o';
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    token_usage: number;
    tier: 'free' | 'pro' | 'premium';
    stripe_customer_id?: string;
    expireAt: Date;
}

type ChatCompletionRole = 'system' | 'user' | 'assistant';

export interface IChatInterface {
    role: ChatCompletionRole
    content: string | null
}