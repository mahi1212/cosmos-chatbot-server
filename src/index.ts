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
const helmet = require('helmet');
app.use(helmet());

// middlewares
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
// remove in production
app.use(morgan("dev"))
app.use("/api/v1", appRouter);

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    }).catch((err) => {
        console.error(err)
    })



app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})


