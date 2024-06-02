import { NextFunction, Request, Response } from "express"
import User from "../models/Users"
import { hash, compare } from "bcrypt"
import { createToken } from "../utils/token-manager";
import { COOKIE_NAME } from "../utils/constants";
import Chats from "../models/Chats";
import Settings from "../models/Settings";

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    // get all user
    try {
        const users = await User.find().select('-password');

        return res.status(200).json({
            message: "OK",
            users: users
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}

export const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await hash(password, 10)
        // alrady exist checking
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exist",
            })
        }

        // create user, chats & settings
        const user = new User({ name, email, password: hashedPassword })
        await user.save()

        // const chats = new Chats({ user_id: user._id, chats: [] })
        // await chats.save()

        const settings = new Settings({ user_id: user._id })
        await settings.save()
        // create token and store cookie

        // clear previous cookie
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        })

        const token = createToken(user._id.toString(), user.email, "7d")

        //  set cookie
        const expires = new Date()
        expires.setDate(expires.getDate() + 7);

        res.cookie(
            COOKIE_NAME,
            token,
            {
                path: "/",
                domain: process.env.DOMAIN_NAME,
                expires,
                httpOnly: true,
                signed: true
            }
        );

        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
            _id: user._id.toString()
        })
    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}


export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }
        // check is user pass correcy
        const isPasswordCorrect = await compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Incorrect password"
            })
        }

        // clear previous cookie
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        })

        const token = await createToken(existingUser._id.toString(), existingUser.email, "7d")
        // console.log(token)
        //  set cookie
        const expires = new Date()
        expires.setDate(expires.getDate() + 7);

        res.cookie(
            COOKIE_NAME,
            token,
            {
                path: "/",
                domain: process.env.DOMAIN_NAME,
                expires,
                httpOnly: true,
                signed: true
            }
        );

        return res.status(200).json({
            message: "OK",
            name: existingUser.name,
            email: existingUser.email,
            _id: existingUser._id.toString()
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}


export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        console.log(user);
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }

        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        });

        return res.status(200).json({
            message: "Successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = await User.findById(res.locals.jwtData.id)

        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            })
        }

        console.log(user._id.toString(), res.locals.jwtData.id)

        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            })
        }

        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
            id: user._id.toString()
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await Settings.findOne({ user_id: res.locals.jwtData.id })

        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            })
        }

        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            })
        }

        return res.status(200).json({
            message: "OK",
            settings: settings
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await Settings.findOne({ user_id: res.locals.jwtData.id })

        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            })
        }

        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            })
        }

        const { gpt_version, system_prompt, temperature, max_tokens, top_p, frequency_penalty, token_usage } = req.body.settings

        if (gpt_version) settings.gpt_version = gpt_version
        if (system_prompt) settings.system_prompt = system_prompt
        if (temperature) settings.temperature = temperature
        if (max_tokens) settings.max_tokens = max_tokens
        if (top_p) settings.top_p = top_p
        if (frequency_penalty) settings.frequency_penalty = frequency_penalty
        if (token_usage) settings.token_usage = token_usage
        

        await settings.save()

        return res.status(200).json({
            message: "OK",
            settings: settings
        })

    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}