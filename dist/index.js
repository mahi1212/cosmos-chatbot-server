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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import OpenAI from "openai";
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();
const app = (0, express_1.default)();
const port = 5000 || process.env.PORT;
app.use(express_1.default.json());
app.use(cors());
//initialize
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
function embed(string) {
    return __awaiter(this, void 0, void 0, function* () {
        const embedding = yield openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: string,
            encoding_format: "float",
        });
        console.log(embedding.data[0]);
    });
}
const callGPT = (systemPrompt, mainPrompt, context) => __awaiter(void 0, void 0, void 0, function* () {
    let messages = [
        { "role": "system", "content": `${systemPrompt}` },
        { "role": "user", "content": `${mainPrompt} | hidden context is ${context}` }
    ];
    try {
        const completion = yield openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 1000,
            frequency_penalty: 0.7,
            temperature: 0.9,
            // stream: true
        });
        //    stream
        // let sentence = '';
        // for await (const chunk of completion) {
        //     // console.log(chunk.choices[0].delta.content);
        //     sentence = sentence.concat(chunk.choices[0].delta.content);
        // }
        // console.log(sentence);
        // return sentence
        //full content
        // console.log(completion.choices[0].message.content);
        let content = completion.choices[0].message.content;
        messages.push({ "role": "assistant", "content": `${content}` });
        return messages;
    }
    catch (error) {
        console.log(error);
    }
});
const main = (mainPrompt, context) => __awaiter(void 0, void 0, void 0, function* () {
    const systemPrompt = `You are a helpful assistant. You talk like a teacher and help people solve problems. Your name is MahiBot.`;
    // const mainPrompt = `How can i code in node js using js`;
    const gptResponse = yield callGPT(systemPrompt, mainPrompt, context);
    return gptResponse;
    // embed(systemPrompt);
});
app.post('/chat-completion', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const myPrompt = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.mainPrompt;
    const context = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.context;
    console.log(myPrompt, context);
    const completion = yield main(myPrompt, context);
    res.status(200).send({
        message: "success",
        text: completion
    });
    // main();
}));
// for stream and rewrite
const systemMessage = {
    role: "system",
    content: "You are a Askbot. You are supposed to answer the questions asked by the users. Validate the prompts to be a question and it should not in approprite. Give funky responses",
};
// const getStreamCompletionForRewrite = async ({ userPrompt }) => {
//     return openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [systemMessage, { role: "user", content: userPrompt }],
//         stream: true
//     })
// }
app.get('/rewrite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, e_1, _d, _e;
    const { post } = req.query;
    if (!post) {
        res.status(400).send("Post is required");
        return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    try {
        const response = yield openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Analyse this social media post and rewrite it in detail - at least 200 words." },
                { role: "user", content: post }
            ],
            max_tokens: 1000,
            temperature: 0.9,
            stream: true
        });
        try {
            for (var _f = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _c = response_1_1.done, !_c; _f = true) {
                _e = response_1_1.value;
                _f = false;
                const chunk = _e;
                let content = chunk.choices[0].delta.content;
                res.write(`data: ${JSON.stringify(content)}\n\n`);
                if (chunk.choices[0].delta.content === undefined) {
                    res.end();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_c && (_d = response_1.return)) yield _d.call(response_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (error) {
        console.error(error);
        res.write(`data: ${JSON.stringify("Failed to rewrite")}`);
        res.end();
    }
}));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
