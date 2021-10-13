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

const commentRouter: Router = Router({ mergeParams: true });
const commentAccountRouter: Router = Router({ mergeParams: true });
const commentPostRouter: Router = Router({ mergeParams: true });

commentRouter
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
  .patch('/:commentId/:action', asyncHandler(giveActionToComment))
  .get('/:commentId/:action', asyncHandler(getActionOfComment));

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
  .patch('/:commentId/:action', asyncHandler(giveActionToComment))
  .get('/:commentId/:action', asyncHandler(getActionOfComment));

export { commentRouter, commentAccountRouter, commentPostRouter };
