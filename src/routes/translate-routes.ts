import { Router } from "express";
import { loginValidator, validate } from "../utils/validators";
import { makeTranslation } from "../controllers/translate-controllers";
import { verifyToken } from "../utils/token-manager";

const translationRoutes = Router();

// validate(loginValidator),
translationRoutes.post('/translate-rewrite', verifyToken, makeTranslation)

export default translationRoutes;