import { Router } from 'express';
import {
  createPost,
  deletePost,
  getActionsOfPost,
  getAllPosts,
  getCommentsOfPost,
  getPost,
  getPostList,
  giveActionToPost,
  updatePost,
} from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';
import { verifyOwner, verifyRole } from '../middleware/post.middleware';
import { commentRouter, commentAccountRouter } from './comment.route';

const postRouter: Router = Router({ mergeParams: true });
const postAccountRouter: Router = Router({ mergeParams: true });

postRouter
  .get('/', getPostList)
  .get('/:postId', getPost)
  .get('/:postId/comments', getCommentsOfPost)
  .get('/:postId/:action', getActionsOfPost)
  .patch('/:postId/:action', protect, giveActionToPost)
  .use('/:postId/comments', commentRouter);

postAccountRouter
  .get('/', getAllPosts)
  .get('/:postId', getPost)
  .get('/:postId/comments', getCommentsOfPost)
  .get('/:postId/:action', getActionsOfPost)
  .post('/', createPost)
  .patch('/:postId', updatePost)
  .delete('/:postId', verifyRole, deletePost)
  .patch('/:postId/:action', giveActionToPost)
  .use('/:postId/comments', commentAccountRouter);

export { postRouter, postAccountRouter };
