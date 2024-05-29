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

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        // hide password
        // select: false  
    },
    // chats: { type: mongoose.Types.ObjectId, ref: "Chats" },

})

export default mongoose.model("Users", userSchema)