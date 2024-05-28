import express, { Request, Response } from "express";
import { connectDatabase } from "./db/connection";
import morgan from "morgan"
import cookieParser from "cookie-parser"

import appRouter from "./routes";
// import OpenAI from "openai";
const OpenAI = require('openai')
const cors = require('cors')
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(express.json())
app.use(cors({ origin: "http://localhost:5173", credentials: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))
// remove in production
app.use(morgan("dev"))

app.use("/api/v1", appRouter); // domain/api/v1/...

//initialize
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// })


// async function embed(string: string) {
//     const embedding = await openai.embeddings.create({
//         model: "text-embedding-ada-002",
//         input: string,
//         encoding_format: "float",
//     });

//     console.log(embedding.data[0]);
// }


// const callGPT = async (systemPrompt: string, mainPrompt: string, context: any) => {
//     let messages = [
//         { "role": "system", "content": `${systemPrompt}` },
//         { "role": "user", "content": `${mainPrompt} | hidden context is ${context}` }
//     ];

//     try {
//         const completion = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages,
//             max_tokens: 1000,
//             frequency_penalty: 0.7,
//             temperature: 0.9,
//             // stream: true
//         });

//         //    stream
//         // let sentence = '';
//         // for await (const chunk of completion) {
//         //     // console.log(chunk.choices[0].delta.content);
//         //     sentence = sentence.concat(chunk.choices[0].delta.content);
//         // }
//         // console.log(sentence);
//         // return sentence
//         //full content
//         // console.log(completion.choices[0].message.content);
//         let content = completion.choices[0].message.content;

//         messages.push({ "role": "assistant", "content": `${content}` })
//         return messages;

//     } catch (error) {
//         console.log(error);
//     }
// };

// const main = async (mainPrompt: string, context: string) => {
//     const systemPrompt = `You are a helpful assistant. You talk like a teacher and help people solve problems. Your name is MahiBot.`;
//     // const mainPrompt = `How can i code in node js using js`;

//     const gptResponse = await callGPT(systemPrompt, mainPrompt, context);
//     return gptResponse;
//     // embed(systemPrompt);
// };


// app.post('/chat-completion', async (req: Request, res: Response) => {
//     const myPrompt = req?.body?.mainPrompt
//     const context = req?.body?.context

//     console.log(myPrompt, context)

//     const completion = await main(myPrompt, context);
//     res.status(200).send({
//         message: "success",
//         text: completion
//     })
//     // main();
// })


// // for stream and rewrite
// const systemMessage = {
//     role: "system",
//     content:
//         "You are a Askbot. You are supposed to answer the questions asked by the users. Validate the prompts to be a question and it should not in approprite. Give funky responses",
// };

// // const getStreamCompletionForRewrite = async ({ userPrompt }) => {
// //     return openai.chat.completions.create({
// //         model: "gpt-3.5-turbo",
// //         messages: [systemMessage, { role: "user", content: userPrompt }],
// //         stream: true
// //     })
// // }

// app.get('/rewrite', async (req, res) => {
//     const { post } = req.query;
//     if (!post) {
//         res.status(400).send("Post is required");
//         return
//     }

//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "Analyse this social media post and rewrite it in detail - at least 200 words." },
//                 { role: "user", content: post }
//             ],
//             max_tokens: 1000,
//             temperature: 0.9,
//             stream: true
//         });

//         for await (const chunk of response) {
//             let content = chunk.choices[0].delta.content;
//             res.write(`data: ${JSON.stringify(content)}\n\n`);
//             if (chunk.choices[0].delta.content === undefined) {
//                 res.end()
//             }
//         }

//     } catch (error) {
//         console.error(error);
//         res.write(`data: ${JSON.stringify("Failed to rewrite")}`);
//         res.end();
//     }
// })

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    })


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})


