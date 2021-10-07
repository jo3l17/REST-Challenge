import { Router } from "express";
import { passwordChange, passwordRecover } from "../controllers/auth.controller";
import { getUser, verifyUser } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const userRoute = Router()

userRoute
  .patch('/:token/verify', verifyUser)
  .post('/passwords/recovery', passwordRecover)
  .patch('/passwords/:token', passwordChange)
  .get('/me', protect, getUser)
  .get('/:id', getUser)

export { userRoute }