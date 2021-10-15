import express, { Router } from 'express'
import asyncHandler from 'express-async-handler';
import { accountRouter } from './routes/account.route';
import { authRouter } from './routes/auth.route';
import { postRouter } from './routes/post.route';
import { postReportRouter } from './routes/report.route';
import { userRoute } from './routes/user.route';
import { errorHandler } from './utils/error.util';

const expressRouter = express.Router()

export function router(app: Router): Router {
  app
  .use(asyncHandler(authRouter))
  .use('/accounts', asyncHandler(accountRouter))
  .use('/users', asyncHandler(userRoute))
  .use('/posts', postRouter)
  .use('/reports', postReportRouter)
  .use(errorHandler);

  return expressRouter
}