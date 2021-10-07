import { Router } from "express";
import { getAccount } from "../controllers/account.controller";
import { protect } from "../middleware/auth.middleware";
import { postRouter } from "./post.route";

const accountRouter: Router = Router();

accountRouter
  .get('/me', protect, getAccount)
  .get('/:id', getAccount)
  .use('/:accountId/post/', postRouter)

export { accountRouter };