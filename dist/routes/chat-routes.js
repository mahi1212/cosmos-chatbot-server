"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const token_manager_1 = require("../utils/token-manager");
const validators_1 = require("../utils/validators");
const chat_controllers_1 = require("../controllers/chat-controllers");
const chatRoutes = (0, express_1.Router)();
// chat completion route
chatRoutes.post("/new", validators_1.chatCompletionValidator, token_manager_1.verifyToken, chat_controllers_1.generateChatCompletion);
chatRoutes.get("/get-all-chats", token_manager_1.verifyToken, chat_controllers_1.getAllChats);
chatRoutes.get("/get-chat", token_manager_1.verifyToken, chat_controllers_1.getUserChat);
// chatRoutes.delete("/delete-chat", verifyToken, deleteSingleChat)
chatRoutes.delete("/delete-single-chat", token_manager_1.verifyToken, chat_controllers_1.deleteSingleChat);
exports.default = chatRoutes;
