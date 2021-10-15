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
import { commentRouter, commentAccountRouter } from './comment.route';
import { reportAccountRouter } from './report.route';

const postRouter: Router = Router({ mergeParams: true });
const postAccountRouter: Router = Router({ mergeParams: true });
const postMeRouter: Router = Router({ mergeParams: true });

postRouter
  .use('/:postId/comments', commentRouter)
  .get('/', asyncHandler(getPostList))
  .get('/:postId', asyncHandler(verifyPublished), asyncHandler(getAPost))
  .get(
    '/:postId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(getActionsOfPost),
  );

postAccountRouter
  .use('/:postId/comments', commentAccountRouter)
  .use('/:postId/report', reportAccountRouter)
  .get('/', asyncHandler(getPostList))
  .get('/:postId', asyncHandler(verifyPublished), asyncHandler(getAPost))
  .delete(
    '/:postId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deletePost),
  )
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

postMeRouter
  .use('/:postId/comments', commentRouter)
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

export { postRouter, postMeRouter, postAccountRouter };
