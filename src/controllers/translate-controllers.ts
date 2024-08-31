import { Request, Response } from "express";
import Users from "../models/Users";
import { ISettingsInterface } from "../utils/interfaces";
import Settings from "../models/Settings";
import { configureOpenAI } from "../config/openai-config";


const estimateTokenUsage = (text: string): number => {
    // Example: assuming 1 token per 4 characters or adjust based on your tokenization method
    return Math.ceil(text.length + 25);
};

export const makeTranslation = async (req: Request, res: Response) => {
    try {
        const { content, target_language, operation } = req.body;

        const user = await Users.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(400).json({ message: "User not registered or TOKEN malfunctioned" });
        }

        const settings: ISettingsInterface | null = await Settings.findOne({ user_id: user._id });
        if (!settings) {
            return res.status(400).json({ message: "Settings not found" });
        }

        if (settings.tier === "premium" && new Date(settings.expireAt) < new Date()) {
            await Settings.findByIdAndUpdate(
                settings._id,
                { tier: "free", expireAt: new Date() },
                { new: true }
            );
            return res.status(400).json({ message: "Membership expired" });
        }
        const tokenLimit = Number(process.env.FREE_TIER_TOKEN_LIMIT);
        const estimatedTokenUsage = estimateTokenUsage(content);
        // Calculate remaining tokens
        const remainingTokens = tokenLimit - (Number(settings.token_usage));
        // console.log(Number(settings.token_usage), Number(tokenLimit));
        // console.log(`Current Usage: ${(Number(settings.token_usage))}, Estimated Usage: ${estimatedTokenUsage}, Token Limit: ${tokenLimit}`);


        if (settings.tier !== "premium" && estimatedTokenUsage > remainingTokens) {
            return res.status(400).json({ message: "Token limit exceeded" });
        }

        const message: any = [
            { "role": "system", "content": "Your response must be translation or rewrite or detect AI written or not" },
            { "role": "system", "content": "Your response must be in target language(optional) if it is mentioned in the query." },
            { "role": "system", "content": "You will be provided operation type and content everytime, if targeted language available then reply on that else reply on user given content language" },
            { "role": "system", "content": `For example, if content is "Who are you" and operation is "translate" and target language(optional) is "Bengali" then your response should be :  "আপনি কে"` },
            { "role": "system", "content": `If target language is not available make sure to reponse in given user language, if it written in french language reply in french. For example: conetent is "Je m'appelle Mahi. Je suis ingénieur logiciel. J'habite à Sylhet", which is a french language. You have to response in french language while making rewrite operation. In rewrite operation you do not need any target language. ` },
            {
                role: 'user',
                content: `My operation is ${operation}. My content is ${content}, where my target language is ${target_language ? target_language : 'auto ditect'} language`
            },
        ];

        const openai = configureOpenAI();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: message,
            temperature: 1,
            max_tokens: 500,
            stream: false,
        });

        const assistantMessage = completion.choices[0]?.message;
        const tokens = completion?.usage?.total_tokens ?? 0;
        const tokenUsed = settings.token_usage + tokens;

        await Settings.findByIdAndUpdate(settings._id, { token_usage: tokenUsed }, { new: true });

        return res.status(200).json({
            message: "OK",
            content: assistantMessage.content,
            target_language,
            operation
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
}