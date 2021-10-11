import { Actions, Prisma, PrismaClient } from ".prisma/client";
import { equal } from "assert";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { PostModel } from "../models/post.model";

const prisma = new PrismaClient();

class PostService {

  /**
   * 
   * 
   * @param accountId
   * @param body 
   * @returns 
   */
  static create = async (accountId: number, body: PostModel): Promise<PostModel> => {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,  
        published: body.published,
        account: {
          connect: {
            id: accountId
          }
        }
      }
    });

    if (!post) {
      throw createHttpError(404, 'post not found')
    }
  
    return post
  }

  static getPostsFromUser = async (accountId: number): Promise<PostModel[]> => {
    const posts = await prisma.post.findMany({
      where: {
        accountId: accountId
      }
    });

    if (!posts) {
      throw createHttpError(404, 'post not found')
    }
  
    return posts
  }

  static getPublicPosts = async (accountId: number): Promise<PostModel[]> => {
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          {
            published: {
              equals: true
            },
            accountId: isNaN(accountId) ? undefined : accountId
          }
        ]
      }
    });

    if (!posts) {
      throw createHttpError(404, 'post not found')
    }
  
    return posts
  }

  static getPostDetermined = async (postId: number): Promise<PostModel> => {
    const post = await prisma.post.findFirst({
      where: {
        AND: [
          {
            id: {
              equals: postId
            },
            published: {
              equals: true
            }
          }
        ]
      }
    });

    if (!post) {
      throw createHttpError(404, 'post not found')
    }

    return post
  }

  static getOwnPost = async (postId: number, accountId: number): Promise<PostModel> => {
    const post = await prisma.post.findFirst({
      where: {
        AND: [
          {
            id: {
              equals: postId
            },
            accountId: {
              equals: accountId
            },
          }
        ]
      }
    });

    if (!post) {
      throw createHttpError(404, 'post not found')
    }

    return post
  }

  static update = async (postId: number, body: PostModel): Promise<PostModel> => {
    const postUpdated = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title: body.title,
        content: body.content,
        published: body.published
      }
    });

    if (!postUpdated) {
      throw createHttpError(404, 'post not found')
    }

    return postUpdated
  }

  static delete = async (postId: number): Promise<PostModel> => {
    const postDeleted = await prisma.post.delete({
      where: {
        id: postId,
      }
    });
      
    if (!postDeleted) {
      throw createHttpError(404, 'post not found')
    }

    return postDeleted
  }

  static recountAction = async (postId: number, actionType: string) => {
    console.log(actionType);
    const action = await prisma.post.findUnique({
      where: {
        id: postId,
      }, 
      select: {
        [actionType]: true
      }
    });
      
    if (!action) {
      throw createHttpError(404, 'post not found')
    }

    return action
  }

  static addAction = async (accountId: number, postId: number, action: string) => {
    const actionByAccount = await prisma.postLike.findFirst({
      select: {
        id: true,
        type: true,
      },
      where: {
        AND: [
          {
            accountId: {
              equals: accountId
            },
            postId: {
              equals: postId
            }
          }
        ]
      }
    });

    let post;
    const newAction = action + 's';
    console.log(newAction)

    if (actionByAccount) {
      const prevAction = actionByAccount?.type + 's';
      console.log(prevAction)
      if (prevAction !== newAction) {
        await PostService.deleteAction(postId, actionByAccount.id, prevAction);
        post = await PostService.createAction(accountId, postId, newAction);
      } else {
        post = await PostService.deleteAction(postId, actionByAccount.id, prevAction);
      }
    } else {
      post = await this.createAction(accountId, postId, newAction);
    }

    return post;
  }
  
   private static createAction = async (accountId: number, postId: number, action: string) => {
    const newAction = action === 'likes' ? Actions.like : Actions.dislike
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        [action]: {
          increment: 1
        },
        likedBy: {
          create: {
            type: newAction,
            accountId: accountId
          }
        }
      }
    });

    console.log(post)

    if (!post) {
      throw createHttpError(404, 'post not found')
    }
    
    return post;
  }
  
  private static deleteAction = async (postId: number, postActionId: number, action: string) => {
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        [action]: {
          decrement: 1
        }
      }
    });
  
    const postAction = await prisma.postLike.delete({
      where: {
        id: postActionId,
      }
    });

    if (!post || !postAction) {
      throw createHttpError(404, 'post not found')
    }
  }
}

export { PostService}