import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    gpt_version: {
        type: String, 
        required: true
    },
    token_length: {
        type: Number,
        required: true
    },
})

export default mongoose.model("Settings", SettingsSchema)