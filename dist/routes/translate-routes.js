"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const translate_controllers_1 = require("../controllers/translate-controllers");
const token_manager_1 = require("../utils/token-manager");
const translationRoutes = (0, express_1.Router)();
// validate(loginValidator),
translationRoutes.post('/translate-rewrite', token_manager_1.verifyToken, translate_controllers_1.makeTranslation);
exports.default = translationRoutes;
