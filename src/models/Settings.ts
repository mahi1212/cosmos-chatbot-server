import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    gpt_version: {
        // const model = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o'
        type: String,
        enum: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o'],
        required: false,
        default: "gpt-3.5-turbo"

    },
    system_prompt: {
        type: String,
        required: false,
        default: "",
    },
    temperature: {
        type: Number,
        required: false,
        default: 1
    },
    max_tokens: {
        type: Number,
        required: false,
        default: 1000
    },
    top_p: {
        type: Number,
        required: false,
        default: 1
    },
    frequency_penalty: {
        type: Number,
        required: false,
        default: 0
    },
    token_usage: {
        type: Number,
        required: false,
        default: 0
    }
}, { timestamps: true })

export default mongoose.model("Settings", SettingsSchema)