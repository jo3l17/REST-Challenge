import { Role } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { CommentService } from '../services/comment.service';

const verifyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const comment = await CommentService.getMyComment(
    parseInt(req.params.commentId),
  );

  const currentAccount = req.accountId;

  if (
    req.user.role !== Role.moderator ||
    currentAccount !== comment.accountId
  ) {
    throw createHttpError(401, 'You do not have authorization for this action');
  }

  next();
};

export { verifyAuthorization };
