import mongoose from "mongoose";
// import chatSchema from "./Chats";

// const chatSchema = new mongoose.Schema({
//     role: {
//         type: String,
//         enum: ['system', 'user', 'assistant'],
//         required: true,
//     },
//     content: {
//         type: String,
//         required: true
//     }
// })

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            this: true,
        },
        password: {
            type: String,
            required: true,
            this: true,
            // hide password
            // select: false  
        },

    },
    { timestamps: true }
)

export default mongoose.model("Users", userSchema)