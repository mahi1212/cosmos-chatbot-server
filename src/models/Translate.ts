import mongoose from "mongoose";

const translateSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    title: {
        type: String,
        required: false,
        default: "No title"
    },
    history: {
        type: Array,
        required: true,
        default: [],
    }
})

export default mongoose.model("Translate", translateSchema)