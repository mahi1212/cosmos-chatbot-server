import { NextFunction, Request, Response } from "express"
import User from "../models/User"
import { hash } from "bcrypt"

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    // get all user
    try {
        const users = await User.find()

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
        
        const user = new User({ name, email, password: hashedPassword })
        await user.save()

        return res.status(200).json({
            message: "OK",
            user: user._id.toString()
        })
    } catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        })
    }
}