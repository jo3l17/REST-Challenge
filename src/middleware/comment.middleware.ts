import { Role } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { CommentService } from '../services/comment.service';

const actions = ['like', 'dislike', 'likes', 'dislikes'];

const verifyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const comment = await CommentService.getDeterminedComment(
    parseInt(req.params.commentId),
  );

  const currentAccount = req.accountId;

  if (
    req.user.role !== Role.moderator &&
    currentAccount !== comment.accountId
  ) {
    throw createHttpError(401, 'You do not have authorization for this action');
  }

  next();
};

const verifyPublished = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const comment = await CommentService.getMyComment(
    parseInt(req.params.commentId),
  );
  if (!comment.published) {
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
