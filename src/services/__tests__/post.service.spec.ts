import { Account, Actions, Post, PrismaClient, User } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { CreatePostDto } from '../../models/posts/request/create.post';
import { UpdatePostDto } from '../../models/posts/request/update.post';
import { PostService } from '../post.service';

jest.mock('http-errors', () => {
  return jest.fn();
});

const prisma = new PrismaClient();

let user: User;
let account: Account;
let publicPost: Post;

beforeEach(() => {
  (createHttpError as jest.MockedFunction<typeof createHttpError>).mockClear();
});

beforeAll(async () => {
  await prisma.$connect;
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
});

afterAll(async () => {
  await prisma.$disconnect;
});

describe('Post Service', () => {
  it('should return the quantify of an action of a post', async () => {
    const result = await PostService.recountAction(publicPost.id, 'likes');
    console.log(result);
    expect(result.likes).toBe(publicPost.likes);
  });

  it('should return a post with a new action added', async () => {
    await PostService.addAction(account.id, publicPost.id, 'like');
    await PostService.addAction(account.id, publicPost.id, 'dislike');

    const deleteAction = await PostService.addAction(
      account.id,
      publicPost.id,
      'dislike',
    );

    expect(deleteAction.dislikes).toBe(0);
  });

  it('should return a valid post', async () => {
    const body = {
      title: 'REST API fundamentals',
      content: 'It is a brief introduction to REST API',
      published: true,
    };

    const result = await PostService.create(
      account.id,
      plainToClass(CreatePostDto, body),
    );
    expect(typeof result.id === 'number').toBeTruthy();
  });

  it('should return all my posts', async () => {
    const result = await PostService.getAllMyPosts(account.id);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ accountId: account.id }),
      ]),
    );
  });

  it('should return my specific post', async () => {
    const result = await PostService.getMyPost(publicPost.id);
    expect(result.id == publicPost.id).toBeTruthy();
  });

  it('should return global public post list', async () => {
    const result = await PostService.getPublicPosts();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ published: true })]),
    );
  });

  it('should return public posts of an account', async () => {
    const result = await PostService.getPublicPosts(account.id);
    expect(Array.isArray(result)).toBeTruthy();
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ published: true })]),
    );
  });

  it('should return a specific public post of an account', async () => {
    const result = await PostService.getDeterminedPost(publicPost.id);
    expect(result.id == publicPost.id).toBeTruthy();
  });

  it('should return an updated post', async () => {
    const updatedTitle = {
      title: 'Introduction to REST API',
    };
    const result = await PostService.update(
      publicPost.id,
      plainToClass(UpdatePostDto, updatedTitle),
    );
    expect(result.title).toEqual(updatedTitle.title);
  });

  it('should return an deleted post', async () => {
    const post = await prisma.post.create({
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
    const result = await PostService.delete(post.id);
    expect(result.id).toEqual(post.id);
  });
});
