import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createPost,
  deletePost,
  getActionsOfPost,
  getOwnPosts,
  getAPost,
  getMyPost,
  getPostList,
  giveActionToPost,
  updatePost,
} from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';
import { verifyAuthorization } from '../middleware/post.middleware';
import { commentRouter, commentPostRouter } from './comment.route';

const postRouter: Router = Router({ mergeParams: true });
const postAccountRouter: Router = Router({ mergeParams: true });

postRouter
  .use('/:postId/comments', commentRouter)
  .get('/', asyncHandler(getPostList))
  .get('/:postId', asyncHandler(getAPost))
  .get('/:postId/:action', asyncHandler(getActionsOfPost))
  .patch('/:postId/:action', protect, asyncHandler(giveActionToPost));

postAccountRouter
  .get('/', asyncHandler(getOwnPosts))
  .get('/:postId', asyncHandler(getMyPost))
  .get('/:postId/:action', asyncHandler(getActionsOfPost))
  .post('/', asyncHandler(createPost))
  .patch('/:postId', asyncHandler(updatePost))
  .delete(
    '/:postId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deletePost),
  )
  .patch('/:postId/:action', asyncHandler(giveActionToPost))
  .use('/:postId/comments', commentPostRouter);

export { postRouter, postAccountRouter };
