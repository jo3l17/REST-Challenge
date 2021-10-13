import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreateCommentDto } from '../models/comments/request/create.comment';
import { UpdateCommentDto } from '../models/comments/request/update.comment';
import { CommentDto } from '../models/comments/response/comment.dto';
import { CommentService } from '../services/comment.service';

const createComment = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreateCommentDto, req.body);
  dto.isValid();

  console.log(req.accountId);
  const comment = await CommentService.create(
    req.accountId,
    parseInt(req.params.postId),
    dto,
  );

  res.status(201).json(plainToClass(CommentDto, comment));
};

const getOwnComments = async (req: Request, res: Response): Promise<void> => {
  const comments = await CommentService.read(req.accountId);

  res.status(200).json(plainToClass(CommentDto, comments));
};

const getMyPost = async (req: Request, res: Response): Promise<void> => {
  const comment = await CommentService.getMyComment(
    parseInt(req.params.commentId),
  );

  res.status(200).json(plainToClass(CommentDto, comment));
};

const getListComments = async (req: Request, res: Response): Promise<void> => {
  const comments = await CommentService.getPublicComments(
    parseInt(req.params.postId),
  );

  res.status(200).json(plainToClass(CommentDto, comments));
};

const updateComment = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(UpdateCommentDto, req.body);
  dto.isValid;

  const comment = await CommentService.update(
    parseInt(req.params.commentId),
    req.body,
  );

  res.status(200).json(plainToClass(CommentDto, comment));
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const commentDeleted = await CommentService.delete(
    parseInt(req.params.commentId),
  );

  res.status(200).json(plainToClass(CommentDto, commentDeleted));
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
  const accountId = parseInt(req.params.accountId) || req.accountId;

  const comment = await CommentService.addAction(
    accountId,
    parseInt(req.params.commentId),
    req.params.action,
  );

  res.status(200).json(plainToClass(CommentDto, comment));
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
