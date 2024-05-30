import { Request, Response, NextFunction } from 'express';
import User from '../models/Users'; // Adjust the path to your User model
import { configureOpenAI } from '../config/openai-config';
import Chats from '../models/Chats';
import Settings from '../models/Settings';

type ChatCompletionRole = 'system' | 'user' | 'assistant';

interface ChatInterface {
    role: ChatCompletionRole
    content: string | null
}

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { message, chat_id } = req.body;
        // console.log(message) //user_id

        const user = await User.findById(res.locals.jwtData.id);
        // const user = await User.findById(user_id);
        // console.log(user, 'generateChatCompletion')
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            })
        }
        interface Settings {
            gpt_version?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o';
            system_prompt?: string;
            temperature?: number;
            max_tokens?: number;
            top_p?: number;
            frequency_penalty?: number;
            token_usage?: number;
        }

        const settings: Settings | null = await Settings.findOne({ user_id: user._id });
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            })
        }
        // find the chat of the collection by user_id
        const chats = await Chats.findOne({ _id: chat_id });
        // const chats = await Chats.findOne({ user_id: user_id });
        if (!chats) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            })
        }

        // now generate the chat
        const newUserMessage: ChatInterface = { role: 'user', content: message };
        chats.chats.push(newUserMessage);

        const fullChat: any = [
            { role: 'system', content: settings?.system_prompt ? settings?.system_prompt : 'You are a pirate. Tell everything with a joke' },
            ...chats.chats
        ];


        const openai = configureOpenAI();
        const completion = await openai.chat.completions.create({
            model: settings?.gpt_version ? settings?.gpt_version : 'gpt-3.5-turbo',
            messages: fullChat,
            max_tokens: 1000,
            frequency_penalty: 0.7,
            temperature: 0.9,
        });
        // Get the latest response
        const assistantMessage = completion.choices[0]?.message;
        chats.chats.push(assistantMessage);
        await chats.save();

        // save title for first time
        if (chats?.chats?.length == 2) {
            chats.title = chats.chats[0].content
            await chats.save()
        }

        return res.status(200).json({
            message: "OK",
            response: chats.chats
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }

};

export const getUserChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.query;
        const user = await User.findById(res.locals.jwtData.id);
        // console.log(user, 'getUserChat')
        // console.log(res.locals.jwtData.id, 'id')
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            })
        }

        // if (user._id.toString() !== res.locals.jwtData.id.toString()) {
        //     return res.status(401).json({
        //         message: "Permission denied",
        //     });
        // }

        if (id) {
            const chats = await Chats.findOne({ _id: id });
            if (!chats) {
                return res.status(400).json({
                    message: "Chat not found"
                });
            }
            return res.status(200).json({
                message: "OK",
                chats: chats.chats,
                title: chats.title,
                _id: chats._id
            });
        } else {
            const chats = new Chats({ user_id: user._id, chats: [] })
            await chats.save()

            return res.status(200).json({
                message: "OK",
                chats: chats.chats,
                title: chats.title,
                _id: chats._id
            });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
}


export const getAllChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id)
        console.log(user)
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            })
        }

        // console.log(user._id.toString(), res.locals.jwtData.id)

        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            })
        }

        // const chats = await Chats.find({ user_id: user._id });
        // find all chats of the collection by user_id
        const chats = await Chats.find({ user_id: user._id }).select('title _id');
        // console.log(chats)
        if (!chats) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            })
        }

        return res.status(200).json({
            message: "OK",
            history: chats
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}


export const deleteSingleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chat_id } = req.body;
        // console.log(res.locals.jwtData.id);

        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }

        // The `user` is definitely not null here due to the previous check
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            });
        }

        const chats = await Chats.findOne({ _id: chat_id });
        if (!chats) {
            return res.status(400).json({
                message: "Chat not found"
            });
        }

        // await chats.deleteOne({ chat_id: chat_id });
        // delete the chat
        // await Chats.findOneAndUpdate({ _id: chat_id }, { chats: [] });
        await Chats.deleteOne({ _id: chat_id });
        return res.status(200).json({
            message: "OK",
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
}