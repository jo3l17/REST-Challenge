import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreatePostDto } from '../models/posts/request/create.post';
import { UpdatePostDto } from '../models/posts/request/update.post';
import { GobalPostDto } from '../models/posts/response/global.post.dto';
import { OwnPostDto } from '../models/posts/response/own.post.dto';
import { ReactionPostDto } from '../models/posts/response/reaction.post';
import { PostService } from '../services/post.service';

const createPost = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreatePostDto, req.body);
  await dto.isValid();

  const post = await PostService.create(req.accountId, dto);

  res.status(201).json(plainToClass(OwnPostDto, post));
};

const getPostList = async (req: Request, res: Response): Promise<void> => {
  const posts = await PostService.getPublicPosts(
    parseInt(req.params.accountId),
  );

  res.status(200).json(plainToClass(GobalPostDto, posts));
};

const getAPost = async (req: Request, res: Response): Promise<void> => {
  const post = await PostService.getDeterminedPost(
    parseInt(req.params.postId),
    parseInt(req.params.accountId),
  );

  res.status(200).json(plainToClass(GobalPostDto, post));
};

const getOwnPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await PostService.getAllMyPosts(req.accountId);

  res.status(200).json(plainToClass(OwnPostDto, posts));
};

const getMyPost = async (req: Request, res: Response): Promise<void> => {
  const post = await PostService.getMyPost(parseInt(req.params.postId));

  res.status(200).json(plainToClass(OwnPostDto, post));
};

const updatePost = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(UpdatePostDto, req.body);
  dto.isValid();

  const postUpdated = await PostService.update(
    parseInt(req.params.postId),
    dto,
  );

  res.status(200).json(plainToClass(GobalPostDto, postUpdated));
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
  const postDeleted = await PostService.delete(parseInt(req.params.postId));

  res.status(200).json(plainToClass(GobalPostDto, postDeleted));
};

const getActionsOfPost = async (req: Request, res: Response): Promise<void> => {
  const actions = await PostService.recountAction(
    parseInt(req.params.postId),
    req.params.action,
  );

  res.status(200).json(actions);
};

const giveActionToPost = async (req: Request, res: Response): Promise<void> => {
  const post = await PostService.addAction(
    req.accountId,
    parseInt(req.params.postId),
    req.params.action,
  );

  res.status(200).json(plainToClass(ReactionPostDto, post));
};

export {
  getPostList,
  getOwnPosts,
  getAPost,
  getMyPost,
  createPost,
  updatePost,
  deletePost,
  getActionsOfPost,
  giveActionToPost,
};
