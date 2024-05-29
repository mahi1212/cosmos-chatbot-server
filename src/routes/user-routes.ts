import { Router } from "express";
import { getAllUser, logoutUser, userLogin, userSignup, verifyUser } from "../controllers/user-controllers";
import { loginValidator, signupValidator, validate } from "../utils/validators";
import { verifyToken } from "../utils/token-manager";

const userRoutes = Router()

userRoutes.get("/", getAllUser)
userRoutes.post("/signup", validate(signupValidator), userSignup)
userRoutes.post("/login", validate(loginValidator), userLogin)
userRoutes.get("/logout", verifyToken, logoutUser)
userRoutes.get("/auth-status", verifyToken, verifyUser)
export default userRoutes;