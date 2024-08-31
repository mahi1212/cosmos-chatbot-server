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
exports.makeTranslation = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const Settings_1 = __importDefault(require("../models/Settings"));
const openai_config_1 = require("../config/openai-config");
const estimateTokenUsage = (text) => {
    // Example: assuming 1 token per 4 characters or adjust based on your tokenization method
    return Math.ceil(text.length + 25);
};
const makeTranslation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { content, target_language, operation } = req.body;
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(400).json({ message: "User not registered or TOKEN malfunctioned" });
        }
        const settings = yield Settings_1.default.findOne({ user_id: user._id });
        if (!settings) {
            return res.status(400).json({ message: "Settings not found" });
        }
        if (settings.tier === "premium" && new Date(settings.expireAt) < new Date()) {
            yield Settings_1.default.findByIdAndUpdate(settings._id, { tier: "free", expireAt: new Date() }, { new: true });
            return res.status(400).json({ message: "Membership expired" });
        }
        const tokenLimit = Number(process.env.FREE_TIER_TOKEN_LIMIT);
        const estimatedTokenUsage = estimateTokenUsage(content);
        // Calculate remaining tokens
        const remainingTokens = tokenLimit - (Number(settings.token_usage));
        // console.log(Number(settings.token_usage), Number(tokenLimit));
        // console.log(`Current Usage: ${(Number(settings.token_usage))}, Estimated Usage: ${estimatedTokenUsage}, Token Limit: ${tokenLimit}`);
        if (settings.tier !== "premium" && estimatedTokenUsage > remainingTokens) {
            return res.status(400).json({ message: "Token limit exceeded" });
        }
        const message = [
            { "role": "system", "content": "Your response must be translation or rewrite or detect AI written or not" },
            { "role": "system", "content": "Your response must be in target language(optional) if it is mentioned in the query." },
            { "role": "system", "content": "You will be provided operation type and content everytime, if targeted language available then reply on that else reply on user given content language" },
            { "role": "system", "content": `For example, if content is "Who are you" and operation is "translate" and target language(optional) is "Bengali" then your response should be :  "আপনি কে"` },
            { "role": "system", "content": `If target language is not available make sure to reponse in given user language, if it written in french language reply in french. For example: conetent is "Je m'appelle Mahi. Je suis ingénieur logiciel. J'habite à Sylhet", which is a french language. You have to response in french language while making rewrite operation. In rewrite operation you do not need any target language. ` },
            {
                role: 'user',
                content: `My operation is ${operation}. My content is ${content}, where my target language is ${target_language ? target_language : 'auto ditect'} language`
            },
        ];
        const openai = (0, openai_config_1.configureOpenAI)();
        const completion = yield openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: message,
            temperature: 1,
            max_tokens: 500,
            stream: false,
        });
        const assistantMessage = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message;
        const tokens = (_c = (_b = completion === null || completion === void 0 ? void 0 : completion.usage) === null || _b === void 0 ? void 0 : _b.total_tokens) !== null && _c !== void 0 ? _c : 0;
        const tokenUsed = settings.token_usage + tokens;
        yield Settings_1.default.findByIdAndUpdate(settings._id, { token_usage: tokenUsed }, { new: true });
        return res.status(200).json({
            message: "OK",
            content: assistantMessage.content,
            target_language,
            operation
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
exports.makeTranslation = makeTranslation;
