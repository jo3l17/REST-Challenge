import { PrismaClient } from '.prisma/client';
import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';

const prisma = new PrismaClient();

const createComment = async (req: Request, res: Response) => {
  const comment = await CommentService.create(
    req.body.user.accountId,
    parseInt(req.body.user.accountId),
    req.body,
  );

  res.status(201).json(comment);
};

const getAllComments = async (req: Request, res: Response) => {
  const comments = await CommentService.read(req.body.user.accountId);

  res.status(200).json(comments);
};

const updateComment = async (req: Request, res: Response) => {
  const comment = await CommentService.update(
    parseInt(req.params.commentId),
    req.body,
  );

  res.status(200).json(comment);
};

const deleteComment = async (req: Request, res: Response) => {
  const commentDeleted = await CommentService.delete(
    parseInt(req.params.commentId),
  );

  res.status(200).json(commentDeleted);
};

const getActionOfComment = async (req: Request, res: Response) => {
  const action = CommentService.recountAction(
    parseInt(req.params.commentId),
    req.params.action,
  );

  res.status(200).json(action);
};

const giveActionToComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.postId);
  const action = req.params.action;
  const accountId = parseInt(req.params.accountId) || req.body.user.accountId;

  const comment = await CommentService.addAction(accountId, commentId, action);

  res.status(200).json(comment);
};

export {
  createComment,
  updateComment,
  deleteComment,
  getAllComments,
  getActionOfComment,
  giveActionToComment,
};
