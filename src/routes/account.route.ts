import { Router } from "express";
import { getAccount } from "../controllers/account.controller";
import { protect } from "../middleware/auth.middleware";
import { commentPostRouter } from "./comment.route";
import { postRouter, postAccountRouter } from "./post.route";

const accountRouter: Router = Router();

accountRouter
  .get('/me', protect, getAccount)
  .get('/:id', getAccount)
  .use('/me/posts', protect, postAccountRouter)
  .use('/:accountId/posts', postRouter)
  .use('/me/comments', protect, commentPostRouter)

export { accountRouter };