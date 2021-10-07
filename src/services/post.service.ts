import { Actions, Prisma, PrismaClient } from ".prisma/client";
import { equal } from "assert";
import { Request, Response } from "express";
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
  
    return post
  }

  static getPostsFromUser = async (accountId: number): Promise<PostModel[]> => {
    const posts = await prisma.post.findMany({
      where: {
        accountId: accountId
      }
    });
  
    return posts
  }

  static getPublicPosts = async (accountId?: number): Promise<PostModel[]> => {
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          {
            published: {
              equals: true
            },
            accountId: accountId != null ? accountId : undefined
          }
        ]
      }
    });
  
    return posts
  }

  static getPostDetermined = async (postId: number, accountId: number): Promise<PostModel> => {
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
            published: {
              equals: true
            }
          }
        ]
      }
    });

    return post!
  }

  static update = async (postId: number, body: PostModel): Promise<PostModel>=> {
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

    console.log(postUpdated)

    return postUpdated
  }
  
  static existActionByUser = async (accountId: number, postId: number) => {
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
    return actionByAccount;
  }
  
  static createAction = async (accountId: number, postId: number, action: string) => {
    const newAction = action === 'like' ? Actions.like : Actions.dislike
  
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        likes: {
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
  }
  
  static deleteAction = async (postId: number, postActionId: number) => {
    const post = await prisma.post.update({
      where: {
        id: postId,
      }, 
      data: {
        likes: {
          decrement: 1
        }
      }
    });
  
    const postAction = await prisma.postLike.delete({
      where: {
        id: postActionId,
      }
    });
  }
}

export { PostService}