import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { COOKIE_NAME } from "./constants";

export const createToken = async (id: string, email: string, expiresIn: string) => {
    const payload = { id, email };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: expiresIn
    })

    return token
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies[`${COOKIE_NAME}`]
    console.log(token)
    if (typeof token !== "string" || !token) {
        return res.status(401).json({ message: "Token not found in cookies" })
    }
    token.toString()
    console.log(token)
   
    // console.log(token)
    if (token == "") {
        return res.status(401).json({ message: "Token not found in cookies" })
    }

    return new Promise<void>((resolve, reject) => {
        return jwt.verify(token, process.env.JWT_SECRET as string, (err: any, success: any) => {
            if (err) {
                reject(err)
                return res.status(401).json({ message: "Unauthorized" })
            }
            console.log("Token verified successfully")
            resolve()
            res.locals.jwtData = success
            return next()
        })
    })
}