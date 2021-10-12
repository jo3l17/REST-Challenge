import { Role } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { PostService } from '../services/post.service';

const verifyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const post = await PostService.getMyPost(parseInt(req.params.postId));

  const currentAccount = req.user.accountId;

  if (currentAccount !== Role.moderator || currentAccount !== post.accountId) {
    throw createHttpError(401, 'You do not have authorization for this action');
  }

  next();
};

export { verifyAuthorization };
