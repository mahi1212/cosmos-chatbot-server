import { Router } from "express";
import { loginValidator, validate } from "../utils/validators";
import { makeTranslation } from "../controllers/translate-controllers";

const translationRoutes = Router();

// validate(loginValidator),
translationRoutes.post('/translate-rewrite', makeTranslation)

export default translationRoutes;