import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

const createPost = async (req: Request, res: Response, next: NextFunction) => {
const data = req.body;

  try {
    const post = await prisma.post.create({data});
    res.status(201).json(post);
  } catch(e) {
    res.status(500).end("create post error")
  }
}

const getPostList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json(posts);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const getPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      }
    });
    res.status(200).json(post);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const postUpdated = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title: req.body.title,
        content: req.body.content,
        published: req.body.published
      }
    });
    res.status(200).json(postUpdated);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
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

const giveLikeToPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        likes: {
          increment: 1
        }
      }
    });
    res.status(200).json(post);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

const giveDislikeToPost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  try {
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        dislikes: {
          decrement: 1
        }
      }
    });
    res.status(200).json(post);
  } catch(e) {
    res.status(500).end("find post list error");
  }
}

export {getPostList, getPost, createPost, updatePost, deletePost, getCommentsOfPost, getLikesOfPost, getDislikesOfPost, giveLikeToPost, giveDislikeToPost};