import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    title: {
        type: String,
        required: false,
    },
    chats: {
        type: Array,
        required: true,
        default: [],
    }
})

export default mongoose.model("Chats", chatSchema)