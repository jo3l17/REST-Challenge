import { Account, Comment, Post, PrismaClient, Report, User } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import { CreateReportDto } from '../../models/reports/request/create.report.dto';
import { ReportService } from '../report.service';

jest.mock('../../utils/sendgrid.util');

const prisma = new PrismaClient();

let user: User;
let account: Account;
let publicPost: Post;
let publicComment: Comment;
let reportTest: Report;

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
          id: account.id,
        },
      },
    },
  });

  reportTest = await ReportService.createReport(
    account.id,
    'post',
    publicPost.id,
    plainToClass(CreateReportDto, {
      title: 'Plagiarism',
      content:
        'This post has to used identical information to another published early.',
    }),
  );
});

describe('Report Service', () => {
  describe('create', () => {
    it('should create a valid report', async () => {
      const body = {
        title: 'Plagiarism',
        content:
          'This post has to used identical information to another published early.',
      };
      const result = await ReportService.createReport(
        account.id,
        'post',
        publicPost.id,
        plainToClass(CreateReportDto, body),
      );
      expect(typeof result.id === 'number').toBeTruthy();
    });
  });

  describe('delete', () => {
    it('should delete a report', async () => {
      const body = {
        title: 'Plagiarism',
        content:
          'This post has to used identical information to another published early.',
      };
      const report = await ReportService.createReport(
        account.id,
        'post',
        publicPost.id,
        plainToClass(CreateReportDto, body),
      );
      const result = await ReportService.deleteReport(report.id);
      expect(result.id).toBe(report.id);
    });
  });

  describe('getReport', () => {
    it('should get a report', async () => {
      const result = await ReportService.getReport(reportTest.id);
      const expected = reportTest.id;

      expect(result.id).toBe(expected);
    });
  });

  describe('getReportList', () => {
    it('should get a report list', async () => {
      const result = await ReportService.getReportList();

      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});
