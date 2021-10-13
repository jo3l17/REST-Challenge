import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreatePostDto } from '../models/posts/request/create.post';
import { UpdatePostDto } from '../models/posts/request/update.post';
import { PostDto } from '../models/posts/response/post.dto';
import { PostService } from '../services/post.service';

const createPost = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(CreatePostDto, req.body);
  await dto.isValid();

  const post = await PostService.create(req.accountId, dto);

  res.status(201).json(plainToClass(PostDto, post));
};

const getPostList = async (req: Request, res: Response): Promise<void> => {
  const posts = await PostService.getPublicPosts(
    parseInt(req.params.accountId),
  );

  res.status(200).json(plainToClass(PostDto, posts));
};

const getAPost = async (req: Request, res: Response): Promise<void> => {
  const post = await PostService.getDeterminedPost(
    parseInt(req.params.postId),
    parseInt(req.params.accountId),
  );

  res.status(200).json(plainToClass(PostDto, post));
};

const getOwnPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await PostService.getAllMyPosts(req.accountId);

  res.status(200).json(plainToClass(PostDto, posts));
};

const getMyPost = async (req: Request, res: Response): Promise<void> => {
  const post = await PostService.getMyPost(parseInt(req.params.postId));

  res.status(200).json(plainToClass(PostDto, post));
};

const updatePost = async (req: Request, res: Response): Promise<void> => {
  const dto = plainToClass(UpdatePostDto, req.body);
  dto.isValid();

  const postUpdated = await PostService.update(
    parseInt(req.params.postId),
    dto,
  );

  res.status(200).json(plainToClass(PostDto, postUpdated));
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
  const postDeleted = await PostService.delete(parseInt(req.params.postId));

  res.status(200).json(plainToClass(PostDto, postDeleted));
};

const getActionsOfPost = async (req: Request, res: Response): Promise<void> => {
  const actions = await PostService.recountAction(
    parseInt(req.params.postId),
    req.params.action,
  );

  res.status(200).json(actions);
};

const giveActionToPost = async (req: Request, res: Response): Promise<void> => {
  const accountId = parseInt(req.params.accountId) || req.accountId;

  const post = await PostService.addAction(
    accountId,
    parseInt(req.params.postId),
    req.params.action,
  );

  res.status(200).json(plainToClass(PostDto, post));
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
