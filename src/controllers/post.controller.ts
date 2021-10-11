import { Actions, PrismaClient } from ".prisma/client";
import { Request, Response } from "express";
import { PostService } from "../services/post.service";

const prisma = new PrismaClient();

const createPost = async (req: Request, res: Response) => {
  const post = await PostService.create(req.body.user.accountId, req.body)
  
  res.status(201).json(post);
}

const getPostList = async (req: Request, res: Response) => {
  const posts = await PostService.getPublicPosts(parseInt(req.params.accountId))
  
  res.status(200).json(posts);
}

const getAllPosts = async (req: Request, res: Response) => {
  const posts = await PostService.getPostsFromUser(req.body.user.accountId);
  
  res.status(200).json(posts);
}

const getAPost = async (req: Request, res: Response) => {
  const post = await PostService.getPostDetermined(parseInt(req.params.postId));
  
  res.status(200).json(post);
}

const getProperPost = async (req: Request, res: Response) => {
  const post = await PostService.getOwnPost(parseInt(req.params.postId), req.body.user.accountId);
  
  res.status(200).json(post);
}

const updatePost = async (req: Request, res: Response) => {
  const postUpdated = PostService.update(parseInt(req.params.postId), req.body)
  
  res.status(200).json(postUpdated);
}

const deletePost = async (req: Request, res: Response) => {
  const postDeleted = PostService.delete(parseInt(req.params.postId))
  
  res.status(200).json(postDeleted);
}

const getCommentsOfPost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  try {
    const comments = await prisma.post.findMany({
      where: {
        id: postId,
      }, 
      include: {
        comments: {
          where: {
            published: true
          }
        }
      }
    });
    res.status(200).json(comments);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const getActionsOfPost = async (req: Request, res: Response) => {
  const actions = await PostService.recountAction(parseInt(req.params.postId), req.params.action);
  
  res.status(200).json(actions);
}

const giveActionToPost = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.accountId) || req.body.user.accountId

  const post = await PostService.addAction(accountId, parseInt(req.params.postId), req.params.action);

  res.status(200).json(post);
}

export {getPostList, getAllPosts, getAPost, getProperPost, createPost, updatePost, deletePost, getCommentsOfPost, getActionsOfPost, giveActionToPost}