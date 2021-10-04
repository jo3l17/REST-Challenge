import { Router } from "express";
import { getUser, verifyUser } from "../controllers/account.controller";
import { passwordRecover, passwordChange } from "../controllers/auth.controller";
import { hashPassword, protect } from "../middleware/auth.middleware";

const accountRouter: Router = Router();

accountRouter.patch('/:token/verify', verifyUser)
  .post('/passwords/recovery', passwordRecover)
  .patch('/passwords/:token', passwordChange)
  .get('/me', protect, getUser)
  .get('/:id', getUser)

export { accountRouter };