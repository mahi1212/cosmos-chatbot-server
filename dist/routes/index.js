"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user-routes"));
const chat_routes_1 = __importDefault(require("./chat-routes"));
const translate_routes_1 = __importDefault(require("./translate-routes"));
const appRouter = (0, express_1.Router)();
appRouter.use("/user", user_routes_1.default);
appRouter.use("/chat", chat_routes_1.default);
appRouter.use('/translation', translate_routes_1.default);
exports.default = appRouter;
