import { ReportType } from '.prisma/client';
import { NextFunction, Request, Response } from 'express';

const resourceType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.locals.resourceId = req.params.commentId;
  res.locals.type = ReportType.comment;
  const test = {
    post: {
      connect: {
        id: res.locals.resourceId,
      },
    },
  };
  console.log(test);
  if (!req.params.commentId) {
    res.locals.resourceId = req.params.postId;
    res.locals.type = ReportType.post;
  }

  next();
};

export { resourceType };
