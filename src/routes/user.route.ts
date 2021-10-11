import { Router } from "express";
import { passwordChange, passwordRecover } from "../controllers/auth.controller";
import { emailChange, getUser, verifyNewEmail, verifyUser } from "../controllers/user.controller";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/auth.middleware";

const userRoute = Router()

userRoute
  .patch('/:token/verify', asyncHandler(verifyUser))
  .post('/passwords/recovery', asyncHandler(passwordRecover))
  .patch('/passwords/:token', asyncHandler(passwordChange))
  .patch('/email', asyncHandler(protect), asyncHandler(emailChange))
  .patch('/email/:token', asyncHandler(verifyNewEmail))
  .get('/me', protect, asyncHandler(getUser))
  .get('/:id', asyncHandler(getUser))

export { userRoute }