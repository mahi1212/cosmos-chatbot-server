import { Router } from "express";
import { getAllUser, userLogin, userSignup } from "../controllers/user-controllers";
import { loginValidator, signupValidator, validate } from "../utils/validators";

const userRoutes = Router()

userRoutes.get("/", getAllUser)
userRoutes.post("/signup", validate(signupValidator), userSignup)
userRoutes.post("/login", validate(loginValidator), userLogin)
export default userRoutes;