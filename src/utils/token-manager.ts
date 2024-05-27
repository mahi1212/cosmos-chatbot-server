import jwt from "jsonwebtoken"

export const createToken = async (id: string, email: string, expiresIn: string) => {
    const payload = { id, email };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: expiresIn
    })
    
    return token
}