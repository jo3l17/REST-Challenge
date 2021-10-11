import { Router } from "express";
import asyncHandler from "express-async-handler";
import { getAccount, updateAccount } from "../controllers/account.controller";
import { protect } from "../middleware/auth.middleware";
import { commentPostRouter } from "./comment.route";
import { postRouter, postAccountRouter } from "./post.route";

const accountRouter: Router = Router();

accountRouter
  .get('/me', protect, asyncHandler(getAccount))
  .get('/:id', asyncHandler(getAccount))
  .patch('/', protect, asyncHandler(updateAccount))
  .use('/me/posts', protect, postAccountRouter)
  .use('/:accountId/posts', postRouter)
  .use('/me/comments', protect, commentPostRouter)

export { accountRouter };