import { Router } from "express";
import { login, logout, refreshToken, signup } from "../controllers/auth.controller";
import { hashPassword, loginCheck } from "../middleware/auth.middleware";

const authRouter: Router = Router();

authRouter.post('/signup', hashPassword, signup)
  .post('/login', loginCheck, login)
  .post('/logout', logout)
  .patch('/refresh-token', refreshToken)


export { authRouter }