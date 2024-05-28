import { Request, Response, NextFunction } from 'express';
import User from '../models/User'; // Adjust the path to your User model
import { configureOpenAI } from '../config/openai-config';

type ChatCompletionRole = 'system' | 'user' | 'assistant';

interface ChatInterface {
    role: ChatCompletionRole;
    content: string;
}

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;

    try {
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }

        // Grab chats of user and map them to the required format
        const chats: ChatInterface[] = user.chats.map(({ role, content }: { role: string; content: string }) => ({
            role: role as ChatCompletionRole, // Explicitly cast role to ChatCompletionRole
            content
        }));

        // Add the user's new message to the chats
        const newUserMessage: ChatInterface = { role: 'user', content: message };
        chats.push(newUserMessage);

        // Create the full chat history including the system message
        const fullChat: ChatInterface[] = [
            { role: 'system', content: 'You are a helpful assistant. You talk like a teacher and help people solve problems. Your name is MahiBot.' },
            ...chats
        ];

        // Add the new user message to the user's chat history
        user.chats.push(newUserMessage);

        const openai = configureOpenAI();
        // Send all chats with the new one to OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: fullChat,
            max_tokens: 1000,
            frequency_penalty: 0.7,
            temperature: 0.9,
        });

        // Get the latest response
        const assistantMessage = completion.choices[0]?.message;
        if (assistantMessage) {
            // Update the user's chat history with the assistant's response
            user.chats.push(assistantMessage);
            await user.save();

            return res.status(200).json({
                message: "OK",
                response: user.chats
            });
        } else {
            console.error("No valid message received from OpenAI.");
            return res.status(500).json({
                message: "ERROR",
                reason: "Failed to receive a valid response from the assistant."
            });
        }
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
};



export const getAllChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id)

        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            })
        }

        // console.log(user._id.toString(), res.locals.jwtData.id)

        if(user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            })
        }

        return res.status(200).json({
            message: "OK",
            chats: user.chats
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}


export const deleteAllChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id)

        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            })
        }

        if(user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            })
        }

        // @ts-ignore
        user.chats = []
        await user.save()
        return res.status(200).json({
            message: "OK",
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}
