import { Router } from "express";
import { getUser, verifyUser } from "../controllers/account.controller";
import { passwordRecover, passwordChange } from "../controllers/auth.controller";
import { hashPassword, protect } from "../middleware/auth.middleware";
import { postRouter } from "./post.route";

const accountRouter: Router = Router();

accountRouter
  .patch('/:token/verify', verifyUser)
  .post('/passwords/recovery', passwordRecover)
  .patch('/passwords/:token', passwordChange)
  .get('/me', protect, getUser)
  .get('/:id', getUser)
  // localhost:3000://posts/ - get all post public
  // localhost:3000://posts/:postId - get all post public
  // localhost:3000://posts/:postId/comments - 

  // localhost:3000://accounts/:accountId/posts - get all post form user 
  // localhost:3000://accounts/:accountId/posts/:postId - get specific post from user 
  // localhost:3000://accounts/:accountId/posts/:postId/comments - get specific post from user 
  .use('/:accountId/post/', postRouter)

export { accountRouter };