import { Router } from "express";
import { verifyToken } from "../utils/token-manager";
import { chatCompletionValidator } from "../utils/validators";
import { deleteSingleChat, generateChatCompletion, getAllChats, getUserChat } from "../controllers/chat-controllers";

const chatRoutes = Router();

// chat completion route
chatRoutes.post("/new", chatCompletionValidator, verifyToken, generateChatCompletion)
chatRoutes.get("/get-all-chats", verifyToken, getAllChats)
chatRoutes.get("/get-chat", verifyToken, getUserChat);
// chatRoutes.delete("/delete-chat", verifyToken, deleteSingleChat)
chatRoutes.delete("/delete-single-chat",verifyToken, deleteSingleChat)

export default chatRoutes;