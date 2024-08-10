import { Router } from "express";
import userRoutes from "./user-routes";
import chatRoutes from "./chat-routes";
import translationRoutes from "./translate-routes";


const appRouter = Router();

appRouter.use("/user", userRoutes)
appRouter.use("/chat", chatRoutes)
appRouter.use('/translation', translationRoutes)

export default appRouter;