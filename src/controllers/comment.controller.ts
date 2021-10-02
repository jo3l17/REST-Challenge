import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

const createComment = async (req: Request, res: Response, next: NextFunction) => {
const data = req.body;

  try {
    const comment = await prisma.comment.create({data});
    res.status(201).json(comment);
  } catch(e) {
    res.status(500).end("create comment error")
  }
}

const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = parseInt(req.params.commentId);
  try {
    const commentUpdated = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: req.body.content,
        published: req.body.published
      }
    });
    res.status(200).json(commentUpdated);
  } catch(e) {
    res.status(500).end("find comment list error");
  }
}

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = parseInt(req.params.commentId);
  try {
    const commentDeleted = await prisma.comment.delete({
      where: {
        id: commentId,
      }
    });
    res.status(200).json(commentDeleted);
  } catch(e) {
    res.status(500).end("find comment list error");
  }
}

const getLikesOfComment = async (req: Request, res: Response, next: NextFunction) => {
    const commentId = parseInt(req.params.postId);
    try {
      const likes = await prisma.comment.findUnique({
        where: {
          id: commentId,
        }, 
        select: {
          likes: true,
          likedBy: true
          
        }
      });
      res.status(200).json(likes);
    } catch(e) {
      res.status(500).end("find post list error");
    }
  }
  
  const getDislikesOfComment = async (req: Request, res: Response, next: NextFunction) => {
    const commentId = parseInt(req.params.postId);
    try {
      const dislikes = await prisma.comment.findUnique({
        where: {
          id: commentId,
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
  
  const giveLikeToComment = async (req: Request, res: Response, next: NextFunction) => {
    const commentId = parseInt(req.params.postId);
    try {
      const comment = await prisma.comment.update({
        where: {
          id: commentId,
        }, 
        data: {
          likes: {
            increment: 1
          }
        }
      });
      res.status(200).json(comment);
    } catch(e) {
      res.status(500).end("find post list error");
    }
  }
  
  const giveDislikeToComment = async (req: Request, res: Response, next: NextFunction) => {
    const commentId = parseInt(req.params.postId);
    try {
      const comment = await prisma.comment.update({
        where: {
          id: commentId,
        }, 
        data: {
          dislikes: {
            decrement: 1
          }
        }
      });
      res.status(200).json(comment);
    } catch(e) {
      res.status(500).end("find post list error");
    }
  }
  
export {createComment, updateComment, deleteComment, getLikesOfComment, getDislikesOfComment, giveLikeToComment, giveDislikeToComment};