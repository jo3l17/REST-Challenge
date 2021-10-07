import { Router } from "express";
import { login, logout, refreshToken, signup } from "../controllers/auth.controller";
import asyncHandler from 'express-async-handler';

const authRouter: Router = Router();

authRouter
  .post('/signup', asyncHandler(signup))
  .post('/login', asyncHandler(login))
  .post('/logout', asyncHandler(logout))
  .patch('/refresh-token', asyncHandler(refreshToken))

export { authRouter }