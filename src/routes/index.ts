import { Router } from "express";
import userRoutes from "./user-routes";
import chatRoutes from "./chat-routes";


const appRouter = Router();

appRouter.use("/user", userRoutes)
appRouter.use("/chat", chatRoutes)

export default appRouter;