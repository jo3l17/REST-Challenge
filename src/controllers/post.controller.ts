import { Actions, PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { PostService } from "../services/post.service";

const prisma = new PrismaClient();

const createPost = async (req: Request, res: Response) => {
  const post = await PostService.create(req.body.user.accountId, req.body)
  if (!post) {
    res.status(500).end("create post error");
  }
  res.status(201).json(post);
}

const getPostList = async (req: Request, res: Response) => {
  const posts = await PostService.getPublicPosts(parseInt(req.params.accountId))
  if (!posts) {
    res.status(500).end("find post list error");
  }
  res.status(200).json(posts);
}

const getAllPosts = async (req: Request, res: Response) => {
  const posts = await PostService.getPostsFromUser(req.body.user.accountId);
  if (!posts) {
    res.status(500).end("find all posts error");
  }
  res.status(200).json(posts);
}

const getPost = async (req: Request, res: Response) => {
  const post = await PostService.getPostDetermined(parseInt(req.params.postId), parseInt(req.params.accountId));
  if (!post) {
    res.status(500).end("find post error");
  }
  res.status(200).json(post);
}

const updatePost = async (req: Request, res: Response) => {
  const postUpdated = PostService.update(parseInt(req.params.postId), req.body)
  if (!postUpdated) {
    res.status(500).end("update post error");
  }
  res.status(200).json(postUpdated);
}

const deletePost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  try {
    const postDeleted = await prisma.post.delete({
      where: {
        id: postId,
      }
    });
    res.status(200).json(postDeleted);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const getCommentsOfPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const comments = await prisma.post.findUnique({
      where: {
        id: postId,
      }, 
      include: {
        comments: true
      }
    });
    res.status(200).json(comments);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const getLikesOfPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const likes = await prisma.post.findUnique({
      where: {
        id: postId,
      }, 
      select: {
        likes: true
      }
    });
    res.status(200).json(likes);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const getDislikesOfPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const dislikes = await prisma.post.findUnique({
      where: {
        id: postId,
      }, 
      select: {
        dislikes: true
      }
    });
    res.status(200).json(dislikes);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const giveActionToPost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  const action = req.params.action;
  const accountId = req.body.user.accountId

  const actionInfo = await PostService.existActionByUser(accountId, postId);

  try {
    if (actionInfo) {
      if (actionInfo?.type !== action) {
        await PostService.deleteAction(postId, actionInfo.id);
        const post = await PostService.createAction(accountId, postId, action);
        res.status(200).json('new like action added');
      } else {
        await PostService.deleteAction(postId, actionInfo.id);
        res.status(200).send('like action deleted');
      }
    } else {
      const post = await PostService.createAction(accountId, postId, action);
      res.status(200).json('like action added');
    }

  } catch(e) {
    res.status(500).end("give like error");
  }
}

export {getPostList, getAllPosts, getPost, createPost, updatePost, deletePost, getCommentsOfPost, getLikesOfPost, getDislikesOfPost, giveActionToPost}