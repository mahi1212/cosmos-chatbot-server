import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['system', 'user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true
    }
})

export default chatSchema