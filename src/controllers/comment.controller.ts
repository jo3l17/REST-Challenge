import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreateCommentDto } from '../models/comments/request/create.comment';
import { UpdateCommentDto } from '../models/comments/request/update.comment';
import { GlobalCommentDto } from '../models/comments/response/global.comment';
import { OwnCommentDto } from '../models/comments/response/own.comment';
import { ReactionCommentDto } from '../models/comments/response/reaction.comment';
import { CommentService } from '../services/comment.service';

const createComment = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreateCommentDto, req.body);
  dto.isValid();

  console.log(req.user.accountId);
  const comment = await CommentService.create(
    req.user.accountId,
    parseInt(req.params.postId),
    dto,
  );

  res.status(201).json(plainToClass(OwnCommentDto, comment));
};

const getOwnComments = async (req: Request, res: Response): Promise<void> => {
  const comments = await CommentService.read(req.user.accountId);

  res.status(200).json(plainToClass(OwnCommentDto, comments));
};

const getMyPost = async (req: Request, res: Response): Promise<void> => {
  const comment = await CommentService.getMyComment(
    parseInt(req.params.commentId),
  );

  res.status(200).json(plainToClass(OwnCommentDto, comment));
};

const getListComments = async (req: Request, res: Response): Promise<void> => {
  const comments = await CommentService.getPublicComments(
    parseInt(req.params.postId),
  );

  res.status(200).json(plainToClass(GlobalCommentDto, comments));
};

const updateComment = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(UpdateCommentDto, req.body);
  dto.isValid;

  const comment = await CommentService.update(
    parseInt(req.params.commentId),
    req.body,
  );

  res.status(200).json(plainToClass(GlobalCommentDto, comment));
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const commentDeleted = await CommentService.delete(
    parseInt(req.params.commentId),
  );

  res.status(200).json(plainToClass(GlobalCommentDto, commentDeleted));
};

const getActionOfComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const action = await CommentService.recountAction(
    parseInt(req.params.commentId),
    req.params.action,
  );

  res.status(200).json(action);
};

const giveActionToComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const comment = await CommentService.addAction(
    req.user.accountId,
    parseInt(req.params.postId),
    req.params.action,
  );

  res.status(200).json(plainToClass(ReactionCommentDto, comment));
};

export {
  createComment,
  updateComment,
  deleteComment,
  getOwnComments,
  getMyPost,
  getListComments,
  getActionOfComment,
  giveActionToComment,
};
