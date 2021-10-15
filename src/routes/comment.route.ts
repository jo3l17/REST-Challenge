import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createComment,
  deleteComment,
  getOwnComments,
  getMyComment,
  getListComments,
  getActionOfComment,
  giveActionToComment,
  updateComment,
  getACommment,
} from '../controllers/comment.controller';
import {
  verifyAction,
  verifyAuthorization,
  verifyPublished,
} from '../middleware/comment.middleware';
import { reportAccountRouter } from './report.route';

const commentRouter: Router = Router({ mergeParams: true });
const commentAccountRouter: Router = Router({ mergeParams: true });
const commentMeRouter: Router = Router({ mergeParams: true });

commentRouter
  .get('/', asyncHandler(getListComments))
  .get('/:commentId', asyncHandler(verifyPublished), asyncHandler(getACommment))
  .get(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(verifyPublished),
    asyncHandler(getActionOfComment),
  );

commentAccountRouter
  .use('/:commentId/report', reportAccountRouter)
  .get('/', asyncHandler(getListComments))
  .post('/', asyncHandler(createComment))
  .get('/:commentId', asyncHandler(verifyPublished), asyncHandler(getACommment))
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

commentMeRouter
  .get('/', asyncHandler(getOwnComments))
  .get('/:commentId', asyncHandler(getMyComment))
  .patch('/:commentId', asyncHandler(updateComment))
  .get(
    '/:commentId/:action',
    asyncHandler(verifyAction),
    asyncHandler(getActionOfComment),
  )
  .patch('/:commentId/:action', asyncHandler(giveActionToComment))
  .delete(
    '/:commenttId',
    asyncHandler(verifyAuthorization),
    asyncHandler(deleteComment),
  );

export { commentRouter, commentMeRouter, commentAccountRouter };
