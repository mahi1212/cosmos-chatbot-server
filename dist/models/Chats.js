"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    title: {
        type: String,
        required: false,
        default: "No title"
    },
    chats: {
        type: Array,
        required: true,
        default: [],
    }
});
exports.default = mongoose_1.default.model("Chats", chatSchema);
