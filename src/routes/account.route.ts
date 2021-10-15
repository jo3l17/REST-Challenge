import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getAccount, updateAccount } from '../controllers/account.controller';
import { verifyAccount } from '../middleware/account.middleware';
import { protect } from '../middleware/auth.middleware';
import { commentMeRouter } from './comment.route';
import { postAccountRouter, postMeRouter } from './post.route';

const accountRouter: Router = Router();

accountRouter
  .get('/me', protect, asyncHandler(getAccount))
  .get('/:id', asyncHandler(getAccount))
  .patch('/me', protect, asyncHandler(updateAccount))
  .use('/me/posts', protect, postMeRouter)
  .use(
    '/:accountId/posts',
    protect,
    asyncHandler(verifyAccount),
    postAccountRouter,
  )
  .use('/me/comments', protect, commentMeRouter);

export { accountRouter };
