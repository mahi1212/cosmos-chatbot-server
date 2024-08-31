"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SettingsSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        default: "You are a helpful chatbot. You help people with their problems.",
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
    },
    tier: {
        type: String,
        enum: ['free', 'pro', 'premium'],
        default: 'free',
        required: false
    },
    expireAt: {
        type: Date,
        default: Date.now,
        required: false
    },
    stripe_customer_id: {
        type: String,
        required: false,
        default: null
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("Settings", SettingsSchema);
