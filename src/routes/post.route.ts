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
import {
  verifyAction,
  verifyAuthorization,
  verifyPublished,
} from '../middleware/post.middleware';
import { commentRouter, commentPostRouter } from './comment.route';
import { reportRouter } from './report.route';

const postRouter: Router = Router({ mergeParams: true });
const postAccountRouter: Router = Router({ mergeParams: true });

postRouter
  .use('/:postId/comments', commentRouter)
  .use('/:postId/report', reportRouter)
  .get('/', asyncHandler(getPostList))
  .get('/:postId', asyncHandler(verifyPublished), asyncHandler(getAPost))
  .get(
    '/:postId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(getActionsOfPost),
  )
  .patch(
    '/:postId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(giveActionToPost),
  );

postAccountRouter
  .use('/:postId/comments', commentPostRouter)
  .get('/', asyncHandler(getOwnPosts))
  .get('/:postId', asyncHandler(getMyPost))

  .post('/', asyncHandler(createPost))
  .patch('/:postId', asyncHandler(updatePost))
  .delete(
    '/:postId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deletePost),
  )
  .get(
    '/:postId/:action',
    asyncHandler(verifyAction),
    asyncHandler(getActionsOfPost),
  )
  .patch(
    '/:postId/:action',
    asyncHandler(verifyAction),
    asyncHandler(giveActionToPost),
  );

export { postRouter, postAccountRouter };
