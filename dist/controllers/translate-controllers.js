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
const Settings_1 = __importDefault(require("../models/Settings"));
const openai_config_1 = require("../config/openai-config");
const makeTranslation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { content, target_language, operation } = req.body;
        // const user = await Users.findById(res.locals.jwtData.id);
        // const user = await User.findById(user_id);
        // if (!user) {
        //     return res.status(400).json({
        //         message: "User not registered or TOKEN malfunctioned"
        //     })
        // }
        const user = {
            _id: "66ab61cdaff010f662856132",
            name: "Cosmos AI",
            email: "cosmosai@gmail.com",
            type: "normal",
            expire_membership: "12-8-2024",
        };
        // if (user._id.toString() !== res.locals.jwtData.id.toString()) {
        //     return res.status(401).json({
        //         message: "Permission denied",
        //     });
        // }
        // now check if the user is premium or not
        if (user.type !== "premium") {
            // if the user is not premium, check if the user has settings
            const settings = yield Settings_1.default.findOne({ user_id: user._id });
            // console.log(settings)
            if (!settings) {
                return res.status(400).json({
                    message: "Settings not found"
                });
            }
            //  check if the user has enough tokens
            if (settings.token_usage !== undefined && settings.token_usage > 1000000) {
                return res.status(400).json({
                    message: "Token limit reached"
                });
            }
            // make the translation, rewrite, AI detection all here
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
                // top_p: 0,
                // frequency_penalty: 0,
                // presence_penalty: 1,
                stream: false,
            });
            const assistantMessage = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message;
            // Get the latest response
            if (settings.token_usage !== undefined) {
                const tokens = (_c = (_b = completion === null || completion === void 0 ? void 0 : completion.usage) === null || _b === void 0 ? void 0 : _b.total_tokens) !== null && _c !== void 0 ? _c : 0;
                const tokenUsed = settings.token_usage + tokens;
                // console.log('Updating settings with token_used:', tokenUsed);
                // Update the settings
                yield Settings_1.default.findByIdAndUpdate(settings._id, { token_usage: tokenUsed }, { new: true });
            }
            return res.status(200).json({
                message: "OK",
                content: assistantMessage.content,
                target_language,
                operation
            });
        }
        else {
            // check if the user is expired
            if (new Date(user.expire_membership) < new Date()) {
                // update the user type to free
                // user.type = "free"
                // await user.save()
                // return res.status(400).json({
                //     message: "Membership expired"
                // })
            }
            else {
                // user is premium and not expired - do the translation, rewrite, AI detection all here
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
                    // top_p: 0,
                    // frequency_penalty: 0,
                    // presence_penalty: 1,
                    stream: false,
                });
                const assistantMessage = (_d = completion.choices[0]) === null || _d === void 0 ? void 0 : _d.message;
                return res.status(200).json({
                    message: "OK",
                    content: assistantMessage,
                    target_language,
                    operation
                });
            }
        }
        return res.status(200).json({
            message: "OK",
            content,
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
