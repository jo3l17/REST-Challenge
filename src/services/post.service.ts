import { Actions, Post, Prisma, PrismaClient } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreatePostDto } from '../models/posts/request/create.post';
import { UpdatePostDto } from '../models/posts/request/update.post';
import { FetchActionPostDto } from '../models/posts/response/fetch.action.post';

const prisma = new PrismaClient();

class PostService {
  static create = async (
    accountId: number,
    body: CreatePostDto,
  ): Promise<Post> => {
    return await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        published: body.published,
        account: {
          connect: {
            id: accountId,
          },
        },
      },
    });
  };

  static getPublicPosts = async (accountId?: number): Promise<Post[]> => {
    console.log(accountId);
    return await prisma.post.findMany({
      where: {
        AND: [
          {
            published: {
              equals: true,
            },
            accountId: accountId,
          },
        ],
      },
    });
  };

  static getAllMyPosts = async (accountId: number): Promise<Post[]> => {
    return prisma.post.findMany({
      where: {
        accountId: accountId,
      },
    });
  };

  static getDeterminedPost = async (
    postId: number,
    accountId: number,
  ): Promise<Post> => {
    const post = await prisma.post.findFirst({
      where: {
        AND: [
          {
            id: {
              equals: postId,
            },
            accountId: {
              equals: accountId,
            },
          },
        ],
      },
    });

    if (!post) {
      throw createHttpError(404, 'Post not found');
    }

    return post;
  };

  static getMyPost = async (postId: number): Promise<Post> => {
    const post = await prisma.post.findFirst({
      where: {
        id: {
          equals: postId,
        },
      },
    });

    if (!post) {
      throw createHttpError(404, 'Post not found');
    }

    return post;
  };

  static update = async (
    postId: number,
    body: UpdatePostDto,
  ): Promise<Post> => {
    try {
      const postUpdated = await prisma.post.update({
        data: body,
        where: {
          id: postId,
        },
      });

      return postUpdated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if ((error.code = 'P2025')) {
          throw createHttpError(404, 'Post to update not found');
        }
      }

      throw createHttpError(500, 'Server error');
    }
  };

  static delete = async (postId: number): Promise<Post> => {
    try {
      const postDeleted = await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return postDeleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if ((error.code = 'P2025')) {
          throw createHttpError(404, 'Post to delete not found');
        }
      }

      throw createHttpError(500, 'Server error');
    }
  };

  static recountAction = async (
    postId: number,
    actionType: string,
  ): Promise<FetchActionPostDto> => {
    console.log(`${postId} - ${actionType}`);

    const action = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        [actionType]: true,
        likedBy: {
          select: {
            accountId: true,
          },
          where: {
            postId: postId,
          },
        },
      },
    });

    if (!action) {
      throw createHttpError(404, 'Post not found');
    }

    return plainToClass(FetchActionPostDto, action);
  };

  static addAction = async (
    accountId: number,
    postId: number,
    action: string,
  ): Promise<Post> => {
    this.getDeterminedPost(postId, accountId);

    const actionByAccount = await prisma.postLike.findFirst({
      select: {
        id: true,
        type: true,
      },
      where: {
        AND: [
          {
            accountId: {
              equals: accountId,
            },
            postId: {
              equals: postId,
            },
          },
        ],
      },
    });

    let post;
    const newAction = action + 's';

    if (actionByAccount) {
      const prevAction = actionByAccount?.type + 's';
      if (prevAction !== newAction) {
        await PostService.deleteAction(postId, actionByAccount.id, prevAction);
        post = await PostService.createAction(accountId, postId, newAction);
      } else {
        post = await PostService.deleteAction(
          postId,
          actionByAccount.id,
          prevAction,
        );
      }
    } else {
      post = await this.createAction(accountId, postId, newAction);
    }

    return post;
  };

  private static createAction = async (
    accountId: number,
    postId: number,
    action: string,
  ): Promise<Post> => {
    const newAction = action === 'likes' ? Actions.like : Actions.dislike;
    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        [action]: {
          increment: 1,
        },
        likedBy: {
          create: {
            type: newAction,
            accountId: accountId,
          },
        },
      },
    });

    return post;
  };

  private static deleteAction = async (
    postId: number,
    postActionId: number,
    action: string,
  ): Promise<Post> => {
    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        [action]: {
          decrement: 1,
        },
      },
    });

    await prisma.postLike.delete({
      where: {
        id: postActionId,
      },
      include: {
        post: true,
      },
    });

    return post;
  };
}

export { PostService };
