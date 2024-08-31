import { Request, Response } from "express";
import Users from "../models/Users";
import { ISettingsInterface } from "../utils/interfaces";
import Settings from "../models/Settings";
import { configureOpenAI } from "../config/openai-config";

export const makeTranslation = async (req: Request, res: Response) => {
    try {
        const { content, target_language, operation } = req.body;

        const user = await Users.findById(res.locals.jwtData.id);
        // const user = await Users.findById(user_id);
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            })
        }

        // const user = {
        //     _id: "66ab61cdaff010f662856132",
        //     name: "Cosmos AI",
        //     email: "cosmosai@gmail.com",
        //     type: "normal",
        //     expire_membership: "12-8-2024",
        // }

        if (user._id.toString() !== res.locals.jwtData.id.toString()) {
            return res.status(401).json({
                message: "Permission denied",
            });
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
            // top_p: 0,
            // frequency_penalty: 0,
            // presence_penalty: 1,
            stream: false,
        });
        const assistantMessage = completion.choices[0]?.message;

        return res.status(200).json({
            message: "OK",
            content: assistantMessage,
            target_language,
            operation
        })

        // now check if the user is premium or not
        // if (user.type !== "premium") {
        //     // if the user is not premium, check if the user has settings
        //     const settings: ISettingsInterface | null = await Settings.findOne({ user_id: user._id });
        //     // console.log(settings)
        //     if (!settings) {
        //         return res.status(400).json({
        //             message: "Settings not found"
        //         })
        //     }
        //     //  check if the user has enough tokens
        //     if (settings.token_usage !== undefined && settings.token_usage > 1000000) {
        //         return res.status(400).json({
        //             message: "Token limit reached"
        //         })
        //     }
        //     // make the translation, rewrite, AI detection all here

        //     const message: any = [
        //         { "role": "system", "content": "Your response must be translation or rewrite or detect AI written or not" },
        //         { "role": "system", "content": "Your response must be in target language(optional) if it is mentioned in the query." },
        //         { "role": "system", "content": "You will be provided operation type and content everytime, if targeted language available then reply on that else reply on user given content language" },
        //         { "role": "system", "content": `For example, if content is "Who are you" and operation is "translate" and target language(optional) is "Bengali" then your response should be :  "আপনি কে"` },
        //         { "role": "system", "content": `If target language is not available make sure to reponse in given user language, if it written in french language reply in french. For example: conetent is "Je m'appelle Mahi. Je suis ingénieur logiciel. J'habite à Sylhet", which is a french language. You have to response in french language while making rewrite operation. In rewrite operation you do not need any target language. ` },
        //         {
        //             role: 'user',
        //             content: `My operation is ${operation}. My content is ${content}, where my target language is ${target_language ? target_language : 'auto ditect'} language`
        //         },
        //     ];

        //     const openai = configureOpenAI();
        //     const completion = await openai.chat.completions.create({
        //         model: 'gpt-4o-mini',
        //         messages: message,
        //         temperature: 1,
        //         max_tokens: 500,
        //         // top_p: 0,
        //         // frequency_penalty: 0,
        //         // presence_penalty: 1,
        //         stream: false,
        //     });
        //     const assistantMessage = completion.choices[0]?.message;

        //     // Get the latest response

        //     if (settings.token_usage !== undefined) {
        //         const tokens = completion?.usage?.total_tokens ?? 0;
        //         const tokenUsed = settings.token_usage + tokens;
        //         // console.log('Updating settings with token_used:', tokenUsed);
        //         // Update the settings
        //         await Settings.findByIdAndUpdate(settings._id, { token_usage: tokenUsed }, { new: true });
        //     }

        //     return res.status(200).json({
        //         message: "OK",
        //         content: assistantMessage.content,
        //         target_language,
        //         operation
        //     })

        // } else {
        //     // check if the user is expired
        //     if (new Date(user.expire_membership) < new Date()) {
        //         // update the user type to free
        //         // user.type = "free"
        //         // await user.save()


        //         // return res.status(400).json({
        //         //     message: "Membership expired"
        //         // })
        //     } else {
        //         // user is premium and not expired - do the translation, rewrite, AI detection all here
        //         const message: any = [
        //             { "role": "system", "content": "Your response must be translation or rewrite or detect AI written or not" },
        //             { "role": "system", "content": "Your response must be in target language(optional) if it is mentioned in the query." },
        //             { "role": "system", "content": "You will be provided operation type and content everytime, if targeted language available then reply on that else reply on user given content language" },
        //             { "role": "system", "content": `For example, if content is "Who are you" and operation is "translate" and target language(optional) is "Bengali" then your response should be :  "আপনি কে"` },
        //             { "role": "system", "content": `If target language is not available make sure to reponse in given user language, if it written in french language reply in french. For example: conetent is "Je m'appelle Mahi. Je suis ingénieur logiciel. J'habite à Sylhet", which is a french language. You have to response in french language while making rewrite operation. In rewrite operation you do not need any target language. ` },
        //             {
        //                 role: 'user',
        //                 content: `My operation is ${operation}. My content is ${content}, where my target language is ${target_language ? target_language : 'auto ditect'} language`
        //             },
        //         ];

        //         const openai = configureOpenAI();
        //         const completion = await openai.chat.completions.create({
        //             model: 'gpt-4o-mini',
        //             messages: message,
        //             temperature: 1,
        //             max_tokens: 500,
        //             // top_p: 0,
        //             // frequency_penalty: 0,
        //             // presence_penalty: 1,
        //             stream: false,
        //         });
        //         const assistantMessage = completion.choices[0]?.message;

        //         return res.status(200).json({
        //             message: "OK",
        //             content: assistantMessage,
        //             target_language,
        //             operation
        //         })

        //     }
        // }



        return res.status(200).json({
            message: "OK",
            content,
            target_language,
            operation
        })

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
}