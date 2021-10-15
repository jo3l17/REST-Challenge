import { ReportType, Role } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

const verifyAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  console.log(req.user);

  if (req.user.role !== Role.moderator) {
    throw createHttpError(401, 'You do not have authorization for this action');
  }

  next();
};

const resourceType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.locals.resourceId = req.params.commentId;
  res.locals.type = ReportType.comment;
  if (!req.params.commentId) {
    res.locals.resourceId = req.params.postId;
    res.locals.type = ReportType.post;
  }

  next();
};

export { verifyAuthorization, resourceType };
