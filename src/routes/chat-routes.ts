import { Router } from "express";
import { verifyToken } from "../utils/token-manager";
import { chatCompletionValidator } from "../utils/validators";
import { generateChatCompletion } from "../controllers/chat-controllers";

const chatRoutes = Router();

chatRoutes.post("/new", chatCompletionValidator, verifyToken, generateChatCompletion)

export default chatRoutes;