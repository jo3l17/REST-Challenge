import { Actions, Post, PrismaClient } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import { CreatePostDto } from '../models/posts/request/create-post.dto';
import { UpdatePostDto } from '../models/posts/request/update-post.dto';
import { FetchActionPostDto } from '../models/posts/response/fetch-action-post.dto';

const prisma = new PrismaClient();

class PostService {
  static create = (accountId: number, body: CreatePostDto): Promise<Post> => {
    return prisma.post.create({
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

  static getPublicPosts = (accountId?: number): Promise<Post[]> => {
    return prisma.post.findMany({
      where: {
        published: true,
        accountId: accountId ? accountId : undefined,
      },
    });
  };

  static getAllMyPosts = async (accountId: number): Promise<Post[]> => {
    return prisma.post.findMany({
      where: {
        accountId,
      },
    });
  };

  static getPostById = async (postId: number): Promise<Post> => {
    const post = await prisma.post.findFirst({
      where: {
        id: {
          equals: postId,
        },
      },
      rejectOnNotFound: true,
    });

    return post;
  };

  static getMyPost = async (postId: number): Promise<Post> => {
    const post = await prisma.post.findFirst({
      where: {
        id: {
          equals: postId,
        },
      },
      rejectOnNotFound: true,
    });

    return post;
  };

  static update = async (
    postId: number,
    body: UpdatePostDto,
  ): Promise<Post> => {
    const post = await this.getMyPost(postId);
    const postUpdated = await prisma.post.update({
      data: body,
      where: {
        id: post.id,
      },
    });

    return postUpdated;
  };

  static delete = async (postId: number): Promise<Post> => {
    const post = await this.getMyPost(postId);
    const postDeleted = await prisma.post.delete({
      where: {
        id: post.id,
      },
    });

    return postDeleted;
  };

  static recountAction = async (
    postId: number,
    actionType: string,
  ): Promise<FetchActionPostDto> => {
    const action = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        [actionType]: true,
        likedBy: {
          select: {
            accountId: true,
            type: true,
          },
          where: {
            postId: postId,
          },
        },
      },
      rejectOnNotFound: true,
    });

    return plainToClass(FetchActionPostDto, action);
  };

  static addAction = async (
    accountId: number,
    postId: number,
    action: string,
  ): Promise<Post> => {
    this.getPostById(postId);

    const actionByAccount = await prisma.postLike.findFirst({
      select: {
        id: true,
        type: true,
      },
      where: {
        accountId,
        postId
      },
    });

    let post;
    const newAction = action + 's';

    if (actionByAccount) {
      const prevAction = actionByAccount.type + 's';
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
            accountId,
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
