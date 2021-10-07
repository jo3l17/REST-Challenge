import { Router } from "express";
import { getAccount } from "../controllers/account.controller";
import { protect } from "../middleware/auth.middleware";
import { postRouter, postAccountRouter } from "./post.route";
import {  protect } from "../middleware/auth.middleware";

const accountRouter: Router = Router();

accountRouter
  .get('/me', protect, getAccount)
  .get('/:id', getAccount)
  .use('/me/posts', protect, postAccountRouter)
  .use('/:accountId/posts', postRouter)

export { accountRouter };