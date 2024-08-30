import mongoose from "mongoose";

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