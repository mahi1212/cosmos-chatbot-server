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
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
// remove in production
app.use(morgan("dev"))

app.use("/api/v1", appRouter); // domain/api/v1/...

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


