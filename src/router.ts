import express, { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { accountRouter } from './routes/account.route';
import { authRouter } from './routes/auth.route';
import { postRouter } from './routes/post.route';
import { reportRouter } from './routes/report.route';
import { userRoute } from './routes/user.route';
import { errorHandler } from './utils/error.util';

const expressRouter = express.Router();

export function router(app: Router): Router {
  app
    .use('/api/v1', asyncHandler(authRouter))
    .use('/api/v1/accounts', asyncHandler(accountRouter))
    .use('/api/v1/users', asyncHandler(userRoute))
    .use('/api/v1/posts', postRouter)
    .use('/api/v1/reports', reportRouter)
    .use(errorHandler)
    .use('/docs', (req: Request, res: Response) => {
      res.redirect(
        'https://app.swaggerhub.com/apis-docs/nerdery3/Microblog-API/1.0.0',
      );
    });

  return expressRouter;
}
