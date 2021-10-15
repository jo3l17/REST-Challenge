import { Account, PrismaClient, User } from '.prisma/client';
import { plainToClass } from 'class-transformer';
import createHttpError from 'http-errors';
import { UpdateAccountDto } from '../../models/account/request/update-account.dto';
import AccountService from '../account.service';

const prisma = new PrismaClient();
let user: User;
let account: Account;
jest.mock('http-errors', () => {
  return jest.fn();
});

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
  user = await prisma.user.create({
    data: {
      email: 'joelvaldez@ravn.co',
      name: 'Joel Valdez',
      password: '12345678',
    },
  });
  account = await prisma.account.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(() => {
  (createHttpError as jest.MockedFunction<typeof createHttpError>).mockClear();
});

describe('account service', () => {
  describe('create', () => {
    it('should return a created Account', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'joelvaldezangeles@gmail.com',
          name: 'Joel Valdez',
          password: '12345678',
        },
      });
      const account = await AccountService.create(user.id);
      expect(account.userId).toEqual(user.id);
    });
  });

  describe('findByUserId', () => {
    it('should return an Account', async () => {
      const account = await AccountService.findByUserId(user.id);
      expect(account).toBeTruthy();
    });
    it('should return null', async () => {
      const account = await AccountService.findByUserId(-1);
      expect(account).toBeFalsy();
    });
  });

  describe('findById', () => {
    it('should return an Account', async () => {
      const accountFound = await AccountService.findById(account.id);
      expect(accountFound).toBeTruthy();
    });

    it('should throw no account found', async () => {
      try {
        await AccountService.findById(-1);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(404);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('no account found');
      }
    });
  });

  describe('update', () => {
    it('should return an updated Account', async () => {
      const data = {
        isEmailPublic: true,
        isNamePublic: false,
      };
      const updatedAccount = await AccountService.update(
        account.id,
        plainToClass(UpdateAccountDto, data),
      );
      expect(updatedAccount.id).toEqual(account.id);
    });
    it('should throw no account found', async () => {
      expect.assertions(2);
      const data = {
        isEmailPublic: true,
        isNamePublic: false,
      };
      try {
        await AccountService.update(
          -1,
          plainToClass(UpdateAccountDto, data),
        );
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(404);
        expect(
            (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
                .calls[0][1],
        ).toMatch('no account found');
      }
    });
  });
});
