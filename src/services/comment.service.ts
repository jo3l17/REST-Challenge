import { Actions, PrismaClient } from ".prisma/client";
import createHttpError from "http-errors";
import { createCommentModel } from "../models/comments/request/create-comment";

const prisma = new PrismaClient()

class CommentService {

  static create = async (accountId: number, postId: number, body: createCommentModel): Promise<createCommentModel> => {
    const commentCreated = await prisma.comment.create({
      data: {
        content: body.content,  
        published: body.published,
        account: {
          connect: {
            id: accountId
          }
        },
        post: {
          connect: {
            id: postId
          }
        }
      }
    });
    
    if (!commentCreated) {
      throw createHttpError(404, 'comment not found');
    }
      
    return commentCreated;
  }

  static read = async (accountId: number) => {
    const comments = await prisma.comment.findMany({
      where: {
        accountId: accountId
      }
    });

    if (!comments) {
      throw createHttpError(404, 'comment not found')
    }
  
    return comments
  }

  static update = async (commentId: number, body: createCommentModel): Promise<createCommentModel> => {
    const commentUpdated = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: body.content,
        published: body.published
      }
    });
    
    if (!commentUpdated) {
      throw createHttpError(404, 'comment not found');
    }
      
    return commentUpdated;
  }

  static delete = async (commentId: number): Promise<createCommentModel> => {
    const commentDeleted = await prisma.comment.delete({
      where: {
        id: commentId,
      }
    });
    
    if (!commentDeleted) {
      throw createHttpError(404, 'comment not found');
    }
      
    return commentDeleted;
  }

  static recountAction = async (commentId: number, actionType: string) => {
    console.log([actionType])
    const action = await prisma.comment.findUnique({
      where: {
        id: commentId,
      }, 
      select: {
        [actionType]: true,
        published: true
      }
    });
      
    console.log(action)
    if (!action) {
      throw createHttpError(404, 'comment not found')
    }

    return action
  }

  static addAction = async (accountId: number, commentId: number, action: string) => {
    const actionByAccount = await prisma.commentLike.findFirst({
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
            commentId: {
              equals: commentId
            }
          }
        ]
      }
    });

    let comment;
    const newAction = action + 's';

    if (actionByAccount) {
      const prevAction = actionByAccount?.type + 's';

      if (prevAction !== newAction) {
        await this.deleteAction(commentId, actionByAccount.id, prevAction);
        comment = await this.createAction(accountId, commentId, newAction);
      } else {
        comment = await this.deleteAction(commentId, actionByAccount.id, prevAction);
      }
    } else {
      comment = await this.createAction(accountId, commentId, newAction);
    }

    return comment;
  }
  
   private static createAction = async (accountId: number, commentId: number, action: string) => {
    const newAction = action === 'likes' ? Actions.like : Actions.dislike

    const comment = await prisma.comment.update({
      where: {
        id: commentId,
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

    if (!comment) {
      throw createHttpError(404, 'comment not found')
    }
    
    return comment;
  }
  
  private static deleteAction = async (commentId: number, commentActionId: number, action: string) => {
    const comment = await prisma.comment.update({
      where: {
        id: commentId,
      }, 
      data: {
        [action]: {
          decrement: 1
        }
      }
    });
  
    const commentAction = await prisma.commentLike.delete({
      where: {
        id: commentActionId,
      }
    });

    if (!comment || !commentAction) {
      throw createHttpError(404, 'comment not found')
    }
  }
}

export {CommentService}