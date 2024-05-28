import { Router } from "express";
import { getAllUser, userLogin, userSignup, verifyUser } from "../controllers/user-controllers";
import { loginValidator, signupValidator, validate } from "../utils/validators";
import { verifyToken } from "../utils/token-manager";

const userRoutes = Router()

userRoutes.get("/", getAllUser)
userRoutes.post("/signup", validate(signupValidator), userSignup)
userRoutes.post("/login", validate(loginValidator), userLogin)
userRoutes.get("/auth-status", verifyToken, verifyUser)
export default userRoutes;