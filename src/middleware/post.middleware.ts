import { Role } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { PostService } from '../services/post.service';

const actions = ['like', 'dislike', 'likes', 'dislikes'];

const verifyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const post = await PostService.getMyPost(parseInt(req.params.postId));

  const currentAccount = req.accountId;

  if (req.user.role !== Role.moderator && currentAccount !== post.accountId) {
    throw createHttpError(401, 'You do not have authorization for this action');
  }

  next();
};

const verifyPublished = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const post = await PostService.getMyPost(parseInt(req.params.postId));
  if (!post.published) {
    throw createHttpError('You can not access to this resource');
  }

  next();
};

const verifyAction = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const action = req.params.action;
  if (!actions.includes(action)) {
    throw createHttpError(422, `${action} not supported`);
  }

  next();
};

export { verifyAuthorization, verifyPublished, verifyAction };
