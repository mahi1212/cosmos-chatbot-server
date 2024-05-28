import { Router } from "express";
import { verifyToken } from "../utils/token-manager";
import { chatCompletionValidator } from "../utils/validators";
import { deleteAllChats, generateChatCompletion, getAllChats } from "../controllers/chat-controllers";

const chatRoutes = Router();

chatRoutes.post("/new", chatCompletionValidator, verifyToken, generateChatCompletion)
chatRoutes.get("/get-all", verifyToken, getAllChats)
chatRoutes.delete("/delete-chat", verifyToken, deleteAllChats)

export default chatRoutes;