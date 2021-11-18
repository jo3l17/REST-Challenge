import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getAccount, updateAccount } from '../controllers/account.controller';
import { verifyAccount } from '../middleware/account.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { commentMeRouter } from './comment.route';
import { postAccountRouter, postMeRouter } from './post.route';

const accountRouter: Router = Router();

accountRouter
  .get('/me', authMiddleware, asyncHandler(getAccount))
  .get('/:id', asyncHandler(getAccount))
  .patch('/me', authMiddleware, asyncHandler(updateAccount))
  .use('/me/posts', authMiddleware, postMeRouter)
  .use(
    '/:accountId/posts',
    authMiddleware,
    asyncHandler(verifyAccount),
    postAccountRouter,
  )
  .use('/me/comments', authMiddleware, commentMeRouter);

export { accountRouter };
