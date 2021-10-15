import { Account, PrismaClient, User } from '.prisma/client';
import { hashSync } from 'bcrypt';
import { jwtData } from '../../utils/jwt.util';
import AuthService from '../auth.service';
import createHttpError from 'http-errors';
import { sgMail } from '../../utils/sendgrid.util';
import { CreateUserDto } from '../../models/users/request/create-user.dto';
import { plainToClass } from 'class-transformer';
import { LoginUserDto } from '../../models/users/request/login-user.dto';
import { UserDto } from '../../models/users/response/user.dto';
import { Request } from 'express';

const prisma = new PrismaClient();

jest.mock('http-errors', () => {
  return jest.fn();
});

jest.mock('../../utils/sendgrid.util');

let user: User;
let authenticatedUser: User;
let verifiedUser: User;

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
  const HASH = await AuthService.hashPassword('12345678');
  authenticatedUser = await prisma.user.create({
    data: {
      email: 'joelvaldezangeles@gmail.com',
      name: 'Joel Valdez',
      password: HASH,
      verifiedAt: new Date(),
      account: {
        create: {}
      }
    },
  });
  verifiedUser = await prisma.user.create({
    data: {
      email: 'cvo523@hotmail.com',
      name: 'Joel Valdez',
      role: 'moderator',
      password: HASH,
      verifiedAt: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(() => {
  (createHttpError as jest.MockedFunction<typeof createHttpError>).mockClear();
  (
    sgMail.send as unknown as jest.MockedFunction<typeof createHttpError>
  ).mockClear();
});

describe('Authentication service: ', () => {
  describe('validate password ', () => {
    const hashedPassword = hashSync('12345678', 12);
    it('should return true', async () => {
      expect(
        await AuthService.validatePassword('12345678', hashedPassword),
      ).toBeTruthy();
    });

    it('should return false', async () => {
      expect(
        await AuthService.validatePassword('123456789', hashedPassword),
      ).toBeFalsy();
    });
  });

  describe('create Token', () => {
    it('should return a valid token', async () => {
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.createToken(data);
      expect(token.userId).toEqual(user.id);
    });
  });

  describe('generateToken', () => {
    it('should return a generated token', async () => {
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.generateToken(data);
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should throw token expired and send new email', async () => {
      expect.assertions(2);
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.generateToken(data, '-10s');
      await prisma.token.create({
        select: {
          token: true,
          expirationDate: true,
          userId: true,
        },
        data: {
          token,
          userId: data.id,
          expirationDate: new Date(),
        },
      });
      try {
        await AuthService.verifyToken(token, 'verification');
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(100);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('token expired, new token sent to email');
      }
    });

    it('should throw token expired', async () => {
      expect.assertions(2);
      const data: jwtData = { id: user.id, role: 'user', type: 'session' };
      const token = await AuthService.generateToken(data, '-10s');
      await prisma.token.create({
        select: {
          token: true,
          expirationDate: true,
          userId: true,
        },
        data: {
          token,
          userId: data.id,
          expirationDate: new Date(),
        },
      });
      try {
        await AuthService.verifyToken(token);
      } catch (e) {
        console.log(e);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(498);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('token expired');
      }
    });

    it('should return a verifiedToken', async () => {
      expect.assertions(2);
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.generateToken(data);
      const result = await AuthService.verifyToken(token, 'verification');

      expect(result.id).toEqual(user.id);
      expect(result.role).toEqual(user.role);
    });

    it('should throw invalid token', async () => {
      expect.assertions(2);
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.generateToken(data);
      try {
        await AuthService.verifyToken(token);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('invalid token');
      }
    });
  });

  describe('sendNewVerification', () => {
    it('should create an send an email', async () => {
      const data: jwtData = { id: user.id, role: 'user', type: 'verification' };
      const token = await AuthService.createToken(data);
      await AuthService.sendNewVerification(token.token);
      expect(sgMail.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteToken', () => {
    it('should return a deleted token', async () => {
      const token = await prisma.token.create({
        data: {
          token: '123',
          expirationDate: new Date(),
          userId: user.id,
        },
      });
      const deletedToken = await AuthService.deleteToken(token.id);
      expect(deletedToken.id).toEqual(token.id);
    });
  });

  describe('deleteTokenByUserId', () => {
    it('should return all deleted tokens', async () => {
      await prisma.token.create({
        data: {
          token: '123',
          expirationDate: new Date(),
          userId: user.id,
        },
      });
      await prisma.token.create({
        data: {
          token: '123',
          expirationDate: new Date(),
          userId: user.id,
        },
      });
      const deletedTokens = await AuthService.deleteTokenByUserId(user.id);
      expect(deletedTokens.count).toBe(6);
    });
  });

  describe('uniqueEmail', () => {
    it('should return true', async () => {
      const result = await AuthService.uniqueEmail('johndoe@email.com');
      expect(result).toBeTruthy();
    });

    it('should return false', async () => {
      const result = await AuthService.uniqueEmail('joelvaldez@ravn.co');
      expect(result).toBeFalsy();
    });
  });

  describe('signup', () => {
    it('should return a token', async () => {
      const user = {
        name: 'john doe',
        email: 'johndoe7@email.com',
        password: '123456789',
      };
      const userData = plainToClass(CreateUserDto, user);
      const token = await AuthService.signup(userData);
      expect(typeof token.token).toBe('string');
    });

    it('should throw email already registered', async () => {
      expect.assertions(2);
      const userData = plainToClass(CreateUserDto, user);
      try {
        const token = await AuthService.signup(userData);
        console.log(token);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('This email is already registered');
      }
    });
  });

  describe('login', () => {
    it('should return a token', async () => {
      const loginData = plainToClass(LoginUserDto, {
        email: 'joelvaldezangeles@gmail.com',
        password: '12345678',
      });
      const token = await AuthService.login(loginData);
      expect(typeof token.token).toBe('string');
    });

    it('should return a token with accountId', async () => {
      const loginData = plainToClass(LoginUserDto, {
        email: 'joelvaldezangeles@gmail.com',
        password: '12345678',
      });
      const token = await AuthService.login(loginData);
      const payload = await AuthService.verifyToken(token.token);
      expect(typeof token.token).toBe('string');
      expect(payload.accountId).toBeTruthy();
    });

    it('should return a token without accountId', async () => {
      const loginData = plainToClass(LoginUserDto, {
        email: 'cvo523@hotmail.com',
        password: '12345678',
      });
      const token = await AuthService.login(loginData);
      const payload = await AuthService.verifyToken(token.token);
      expect(payload.accountId).toBeFalsy();
    });

    it('should throw the email or password are wrong', async () => {
      expect.assertions(2);
      const loginData = plainToClass(LoginUserDto, {
        email: 'joelvaldezangeles@gmail.com',
        password: '123456789',
      });
      try {
        await AuthService.login(loginData);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('The email or password are wrong');
      }
    });
  });
  describe('recoverPassword', () => {
    it('should send a recover email', async () => {
      expect.assertions(2);
      const user = plainToClass(UserDto, authenticatedUser);
      const token = await AuthService.recoverPassword(user);
      expect(sgMail.send).toHaveBeenCalledTimes(1);
      expect(typeof token).toBe('string');
    });
  });

  describe('hashPassword', () => {
    it('should return a hashed password', async () => {
      const hashedPassword = await AuthService.hashPassword('12345678');
      expect(typeof hashedPassword).toBe('string');
    });
  });

  describe('findHeaderToken', () => {
    it('should throw no token found', async () => {
      const req = { headers: { authorization: 'Bearer 123' } };
      try {
        await AuthService.findHeaderToken(req as Request);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(404);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('no token found');
      }
    });
    
    it('should throw no auth', async () => {
      const req = { headers: { authorization: '' } };
      try {
        await AuthService.findHeaderToken(req as Request);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(401);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('no auth');
      }
    });

    it('should return a valid token', async () => {
      const data: jwtData = { id: user.id, role: 'user', type: 'session' };
      const token = await AuthService.createToken(data);
      const req = { headers: { authorization: `Bearer ${token.token}` } };
      const tokenResponse = await AuthService.findHeaderToken(req as Request);
      expect(tokenResponse.userId).toEqual(token.userId);
    });
  });

  describe('findToken', () => {
    it('should throw no token found', async () => {
      try {
        await AuthService.findToken('123');
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(404);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('no token found');
      }
    });

    it('should return a valid token', async () => {
      const data: jwtData = { id: user.id, role: 'user', type: 'session' };
      const token = await AuthService.createToken(data);
      const tokenResponse = await AuthService.findToken(token.token);
      expect(tokenResponse.userId).toEqual(token.userId);
    });
  });
  describe('updateToken', () => {
    it('should return the updated token', async () => {
      const data: jwtData = {
        id: authenticatedUser.id,
        role: 'user',
        type: 'session',
      };
      const token = await AuthService.createToken(data);
      const tokenToUpdate = await AuthService.findToken(token.token);
      const payload = await AuthService.verifyToken(token.token);
      const updatedToken = await AuthService.updateToken(
        tokenToUpdate.id,
        authenticatedUser.id,
        'session',
      );
      expect(payload.id).toEqual(updatedToken.userId);
    });
  });
});
