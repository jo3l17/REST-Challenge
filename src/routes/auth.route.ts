import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { hashPassword, loginCheck } from "../middleware/auth.middleware";

const authRouter: Router = Router();

authRouter.post('/signup', hashPassword, signup)
  .post('/login', loginCheck, login)


export { authRouter }