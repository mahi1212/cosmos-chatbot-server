import OpenAI from "openai";

export const configureOpenAI  = () => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    return openai
}