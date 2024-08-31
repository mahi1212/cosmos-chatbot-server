"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSingleChat = exports.getAllChats = exports.getUserChat = exports.generateChatCompletion = void 0;
const Users_1 = __importDefault(require("../models/Users")); // Adjust the path to your User model
const openai_config_1 = require("../config/openai-config");
const Chats_1 = __importDefault(require("../models/Chats"));
const Settings_1 = __importDefault(require("../models/Settings"));
const generateChatCompletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { message, chat_id } = req.body;
        // console.log(message) //user_id
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        // const user = await User.findById(user_id);
        // console.log(user, 'generateChatCompletion')
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }
        const settings = yield Settings_1.default.findOne({ user_id: user._id });
        // console.log(settings)
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            });
        }
        // find the chat of the collection by user_id
        const chats = yield Chats_1.default.findOne({ _id: chat_id });
        // const chats = await Chats.findOne({ user_id: user_id });
        if (!chats) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }
        // now generate the chat
        const newUserMessage = { role: 'user', content: message };
        chats.chats.push(newUserMessage);
        const fullChat = [
            { role: 'system', content: (settings === null || settings === void 0 ? void 0 : settings.system_prompt) ? settings === null || settings === void 0 ? void 0 : settings.system_prompt : 'You are a pirate. Tell everything with a joke' },
            ...chats.chats
        ];
        const openai = (0, openai_config_1.configureOpenAI)();
        const completion = yield openai.chat.completions.create({
            model: (settings === null || settings === void 0 ? void 0 : settings.gpt_version) ? settings === null || settings === void 0 ? void 0 : settings.gpt_version : 'gpt-3.5-turbo',
            messages: fullChat,
            max_tokens: 1000,
            frequency_penalty: 0.7,
            temperature: 0.9,
        });
        // Get the latest response
        const assistantMessage = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message;
        chats.chats.push(assistantMessage);
        yield chats.save();
        // console.log(completion.usage)
        // console.log('completion?.usage?.total_tokens:', completion?.usage?.total_tokens);
        // Update token usage in settings
        if (settings.token_usage !== undefined) {
            const tokens = (_c = (_b = completion === null || completion === void 0 ? void 0 : completion.usage) === null || _b === void 0 ? void 0 : _b.total_tokens) !== null && _c !== void 0 ? _c : 0;
            const tokenUsed = settings.token_usage + tokens;
            // console.log('Updating settings with token_used:', tokenUsed);
            // Update the settings
            yield Settings_1.default.findByIdAndUpdate(settings._id, { token_usage: tokenUsed }, { new: true });
            // console.log('Update result:', result);
        }
        // save title for first time
        if (((_d = chats === null || chats === void 0 ? void 0 : chats.chats) === null || _d === void 0 ? void 0 : _d.length) == 2) {
            chats.title = chats.chats[0].content;
            yield chats.save();
        }
        return res.status(200).json({
            message: "OK",
            response: chats.chats
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.generateChatCompletion = generateChatCompletion;
const getUserChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        // console.log(user, 'getUserChat')
        // console.log(res.locals.jwtData.id, 'id')
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }
        // if (user._id.toString() !== res.locals.jwtData.id.toString()) {
        //     return res.status(401).json({
        //         message: "Permission denied",
        //     });
        // }
        if (id) {
            const chats = yield Chats_1.default.findOne({ _id: id });
            if (!chats) {
                return res.status(400).json({
                    message: "Chat not found"
                });
            }
            return res.status(200).json({
                message: "OK",
                chats: chats.chats,
                title: chats.title,
                _id: chats._id
            });
        }
        else {
            const chats = new Chats_1.default({ user_id: user._id, chats: [] });
            yield chats.save();
            return res.status(200).json({
                message: "OK",
                chats: chats.chats,
                title: chats.title,
                _id: chats._id
            });
        }
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
});
exports.getUserChat = getUserChat;
const getAllChats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        console.log(user);
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            });
        }
        // console.log(user._id.toString(), res.locals.jwtData.id)
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            });
        }
        // const chats = await Chats.find({ user_id: user._id });
        // find all chats of the collection by user_id
        const chats = yield Chats_1.default.find({ user_id: user._id }).select('title _id');
        // console.log(chats)
        if (!chats) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }
        return res.status(200).json({
            message: "OK",
            history: chats
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.getAllChats = getAllChats;
const deleteSingleChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_id } = req.body;
        // console.log(res.locals.jwtData.id);
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfunctioned"
            });
        }
        // The `user` is definitely not null here due to the previous check
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            });
        }
        const chats = yield Chats_1.default.findOne({ _id: chat_id });
        if (!chats) {
            return res.status(400).json({
                message: "Chat not found"
            });
        }
        // await chats.deleteOne({ chat_id: chat_id });
        // delete the chat
        // await Chats.findOneAndUpdate({ _id: chat_id }, { chats: [] });
        yield Chats_1.default.deleteOne({ _id: chat_id });
        return res.status(200).json({
            message: "OK",
        });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message,
        });
    }
});
exports.deleteSingleChat = deleteSingleChat;
