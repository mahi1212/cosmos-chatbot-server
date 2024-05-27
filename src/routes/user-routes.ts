import { Router } from "express";
import { getAllUser, userSignup } from "../controllers/user-controllers";

const userRoutes = Router()

userRoutes.get("/", getAllUser)
userRoutes.post("/signup", userSignup)
export default userRoutes;