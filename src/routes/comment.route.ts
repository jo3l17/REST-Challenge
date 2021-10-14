import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createComment,
  deleteComment,
  getOwnComments,
  getMyPost,
  getListComments,
  getActionOfComment,
  giveActionToComment,
  updateComment,
} from '../controllers/comment.controller';
import { verifyAuthorization } from '../middleware/comment.middleware';
import { verifyAction, verifyPublished } from '../middleware/post.middleware';
import { reportRouter } from './report.route';

const commentRouter: Router = Router({ mergeParams: true });
const commentAccountRouter: Router = Router({ mergeParams: true });
const commentPostRouter: Router = Router({ mergeParams: true });

commentRouter
  .use('/:commentId/report', reportRouter)
  .get('/', asyncHandler(getListComments))
  .post('/', asyncHandler(createComment))
  .patch(
    '/:commentId',
    asyncHandler(verifyAuthorization),
    asyncHandler(updateComment),
  )
  .delete(
    '/:commentId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deleteComment),
  )
  .get(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(getActionOfComment),
  )
  .patch(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(giveActionToComment),
  );

commentAccountRouter
  .get('/', asyncHandler(getOwnComments))
  .get('/:commentId', asyncHandler(getMyPost))
  .patch('/:commentId', asyncHandler(updateComment))
  .patch('/:commentId/:action', asyncHandler(giveActionToComment))
  .delete(
    '/:commenttId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deleteComment),
  );

commentPostRouter
  .get('/', asyncHandler(getListComments))
  .post('/', asyncHandler(createComment))
  .get(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(getActionOfComment),
  )
  .patch(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(giveActionToComment),
  );

export { commentRouter, commentAccountRouter, commentPostRouter };
