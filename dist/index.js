"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = require("./db/connection");
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
// import OpenAI from "openai";
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// middlewares
app.use(express_1.default.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
// remove in production
app.use((0, morgan_1.default)("dev"));
app.use("/api/v1", routes_1.default);
(0, connection_1.connectDatabase)()
    .then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}).catch((err) => {
    console.error(err);
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
