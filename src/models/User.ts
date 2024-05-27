import mongoose from "mongoose";
import chatSchema from "./Chats";


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
    chat: [chatSchema]

})

export default mongoose.model("User", userSchema)