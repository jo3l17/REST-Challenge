import { Account, Actions, Comment, Post, PrismaClient, User } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreateCommentDto } from '../../models/comments/request/create.comment';
import { UpdateCommentDto } from '../../models/comments/request/update.comment';
import { CommentService } from '../comment.service';

jest.mock('http-errors', () => {
  return jest.fn();
});

const prisma = new PrismaClient();

let user: User;
let account: Account;
let publicPost: Post;
let publicComment: Comment;

beforeEach(() => {
  (createHttpError as 
    jest.MockedFunction<typeof createHttpError>)
    .mockClear();
});

beforeAll(async () => {
  await prisma.$connect;
  await prisma.post.deleteMany();
  await prisma.account.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  user = await prisma.user.create({
    data: {
      name: 'Juan Pejerrey',
      email: 'juanmdpc@gmail.com',
      password: '123456',
    },
  });

  account = await prisma.account.create({
    data: {
      userId: user.id,
    },
  });

  publicPost = await prisma.post.create({
    data: {
      title: 'REST API fundamentals',
      content: 'It is a brief introduction to REST API',
      published: true,
      account: {
        connect: {
          id: account.id,
        },
      },
    },
  });

  publicComment = await prisma.comment.create({
    data: {
      content: 'Amazing post!',
      published: true,
      post: {
        connect: {
          id: publicPost.id,
        },
      },
      account: {
        connect: {
          id: account.id
        }
      }
    },
  });

  await prisma.post.create({
    data: {
      title: 'REST API fundamentals',
      content: 'It is a brief introduction to REST API',
      published: false,
      account: {
        connect: {
          id: account.id,
        },
      },
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Amazing post!',
      published: false,
      post: {
        connect: {
          id: publicPost.id,
        },
      },
      account: {
        connect: {
          id: account.id
        }
      }
    },
  });
});
  

afterAll(async () => {
  await prisma.$disconnect;
});

describe('Comment Service', () => {
  it('should return the quantify of an action of a comment', async () => {
    const result = await CommentService.recountAction(
      publicComment.id,
      'likes'
    );
    console.log(result)
    expect(result.likes).toBe(publicComment.likes);
  });

  it('should return a comment with a new action added', async() => {
    await CommentService.addAction(
      account.id, 
      publicComment.id, 
      'like'
    );

    await CommentService.addAction(
      account.id, 
      publicComment.id, 
      'dislike'
    );

    const deleteAction = await CommentService.addAction(
      account.id, 
      publicComment.id, 
      'dislike'
    );

    expect(deleteAction.dislikes).toBe(0);
  });

  it('should return a valid comment', async () => {
    const body = {
      content: 'It is a brief introduction to REST API',
      published: true,
    };

    const result = await CommentService.create(
      account.id,
      publicPost.id,
      plainToClass(CreateCommentDto, body),
    );
    expect(typeof result.id === 'number').toBeTruthy();
  });

  it('should return all my comments', async () => {
    const result = await CommentService.read(account.id);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ accountId: account.id }),
      ]),
    );
  });

  it('should return my specific comment', async () => {
    const result = await CommentService.getMyComment(publicComment.id);
    expect(result.id == publicComment.id).toBeTruthy();
  });

  it('should throw comment not found', async () => {
    try {
      await CommentService.getMyComment(-1);
    } catch (error) {
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][0],
      ).toBe(404);
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][1],
      ).toMatch('Comment not found');
    }
  });

  it('should return global public comment list', async () => {
    const result = await CommentService.getPublicComments(publicPost.id);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ published: true })]),
    );
  });

  it('should return public comments of an account', async () => {
    const result = await CommentService.getPublicComments(publicPost.id);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ published: true })]),
    );
  });

  it('should return an updated comment', async () => {
    const updatedTitle = {
      content: 'Wonderful explanation!',
    };
    const result = await CommentService.update(
      publicComment.id,
      plainToClass(UpdateCommentDto, updatedTitle),
    );
    expect(result.content).toEqual(updatedTitle.content);
  });

  it('should throw comment to update not found', async () => {
    try {
      const updatedTitle = {
        title: 'Introduction to REST API',
      };
      await CommentService.update(-1, plainToClass(UpdateCommentDto, updatedTitle));
    } catch (error) {
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][0],
      ).toBe(404);
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][1],
      ).toMatch("Comment to update not found");
    }
  });

  it('should return an deleted comment', async () => {
    const comment = await prisma.comment.create({
      data: {
        content: 'Amazing post!',
        published: true,
        post: {
          connect: {
            id: publicPost.id,
          },
        },
        account: {
          connect: {
            id: account.id
          }
        }
      },
    });
    const result = await CommentService.delete(
      comment.id,
    );
    expect(result.id).toEqual(comment.id);
  });

  it('should throw comment to delete not found', async () => {
    try {
      await CommentService.delete(-1);
    } catch (error) {
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][0],
      ).toBe(404);
      expect(
        (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
          .calls[0][1],
      ).toMatch("Comment to delete not found");
    }
  });
});
