import { Actions, Comment, Prisma, PrismaClient } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreateCommentDto } from '../models/comments/request/create.comment';
import { FetchActionCommentDto } from '../models/comments/response/fetch.action.comment';

const prisma = new PrismaClient();

class CommentService {
  static create = async (
    accountId: number,
    postId: number,
    body: CreateCommentDto,
  ): Promise<Comment> => {
    return await prisma.comment.create({
      data: {
        content: body.content,
        published: body.published,
        account: {
          connect: {
            id: accountId,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
      },
    });
  };

  static read = async (accountId: number): Promise<Comment[]> => {
    return await prisma.comment.findMany({
      where: {
        accountId: accountId,
      },
    });
  };

  static update = async (
    commentId: number,
    body: CreateCommentDto,
  ): Promise<Comment> => {
    try {
      const commentUpdated = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content: body.content,
          published: body.published,
        },
      });

      return commentUpdated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if ((error.code = 'P2025')) {
          throw createHttpError(404, 'Comment to update not found');
        }
      }

      throw error;
    }
  };

  static getMyComment = async (commentId: number): Promise<Comment> => {
    const comment = await prisma.comment.findFirst({
      where: {
        id: {
          equals: commentId,
        },
      },
    });

    if (!comment) {
      throw createHttpError(404, 'Comment not found');
    }

    return comment;
  };

  static delete = async (commentId: number): Promise<Comment> => {
    try {
      const commentDeleted = await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });

      return commentDeleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if ((error.code = 'P2025')) {
          throw createHttpError(404, 'Post to update not found');
        }
      }

      throw error;
    }
  };

  static getPublicComments = async (postId: number): Promise<Comment[]> => {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        published: true,
      },
    });

    return comments;
  };

  static recountAction = async (
    commentId: number,
    actionType: string,
  ): Promise<FetchActionCommentDto> => {
    this.verifyAction(actionType);
    const action = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        [actionType]: true,
        likedBy: {
          select: {
            accountId: true,
          },
          where: {
            commentId: commentId,
          },
        },
      },
    });

    if (!action) {
      throw createHttpError(
        404,
        `Comment not found or ${[actionType]} not supported`,
      );
    }

    return plainToClass(FetchActionCommentDto, action);
  };

  static addAction = async (
    accountId: number,
    commentId: number,
    action: string,
  ): Promise<Comment> => {
    const newAction = action + 's';
    this.verifyAction(newAction);

    const actionByAccount = await prisma.commentLike.findFirst({
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
            commentId: {
              equals: commentId,
            },
          },
        ],
      },
    });

    let comment;
    if (actionByAccount) {
      const prevAction = actionByAccount?.type + 's';

      if (prevAction !== newAction) {
        await this.deleteAction(commentId, actionByAccount.id, prevAction);
        comment = await this.createAction(accountId, commentId, newAction);
      } else {
        comment = await this.deleteAction(
          commentId,
          actionByAccount.id,
          prevAction,
        );
      }
    } else {
      comment = await this.createAction(accountId, commentId, newAction);
    }

    return comment;
  };

  private static createAction = async (
    accountId: number,
    commentId: number,
    action: string,
  ): Promise<Comment> => {
    const newAction = action === 'likes' ? Actions.like : Actions.dislike;

    const comment = await prisma.comment.update({
      where: {
        id: commentId,
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

    if (!comment) {
      throw createHttpError(404, 'comment not found');
    }

    return comment;
  };

  private static deleteAction = async (
    commentId: number,
    commentActionId: number,
    action: string,
  ): Promise<Comment> => {
    const comment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        [action]: {
          decrement: 1,
        },
      },
    });

    await prisma.commentLike.delete({
      where: {
        id: commentActionId,
      },
    });

    return comment;
  };

  private static verifyAction = async (action: string) => {
    if (action !== 'likes' && action !== 'dislikes') {
      throw createHttpError(422, `${action} not supported`);
    }
  };
}

export { CommentService };
