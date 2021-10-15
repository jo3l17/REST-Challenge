import { PrismaClient, User } from ".prisma/client";
import { plainToClass } from "class-transformer";
import createHttpError from "http-errors";
import { CreateUserDto } from "../../models/users/request/create-user.dto";
import { sgMail } from "../../utils/sendgrid.util";
import AuthService from "../auth.service";
import UserService from "../user.service";

jest.mock('http-errors', () => {
  return jest.fn();
});

jest.mock('../../utils/sendgrid.util');

const prisma = new PrismaClient()
let user: User;
let authenticatedUser: User;
let authenticatedUserwithNoTemp: User

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany();
  user = await prisma.user.create({
    data: {
      email: 'joelvaldez@ravn.co',
      name: 'Joel Valdez',
      password: '12345678',
      role:'moderator'
    },
  });
  const HASH = await AuthService.hashPassword('12345678');
  authenticatedUser = await prisma.user.create({
    data: {
      email: 'joelvaldezangeles@gmail.com',
      name: 'Joel Valdez',
      temporalEmail: 'new@gmail.com',
      password: HASH,
      verifiedAt: new Date(),
      account: {
        create: {},
      },
    },
  });
  authenticatedUserwithNoTemp = await prisma.user.create({
    data: {
      email: 'joelvaldezangeles2@gmail.com',
      name: 'Joel Valdez',
      password: HASH,
      verifiedAt: new Date(),
      account: {
        create: {},
      },
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

describe('User service', () => {
  describe('create', () => {
    it('should return a user created', async () => {
      const data = {
        email: 'joelvaldez+1@ravn.co',
        name: 'Joel Valdez',
        password: '12345678',
      }
      const user = await UserService.create(plainToClass(CreateUserDto, data))
      expect(user.email).toBe(data.email)
    })
  })

  describe('findByEmail', () => {
    it('should return a user found', async () => {
      const userFound = await UserService.findByEmail(authenticatedUser.email)
      expect(userFound.id).toBe(authenticatedUser.id);
    })
    it('should throw user not verified', async () => {
      expect.assertions(2);
      try {
        await UserService.findByEmail(user.email);
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('email not verified');
      }
    })
  })

  describe('findVerifiedById', () => {
    it('should return an user', async () => {
      const userFound = await UserService.findVerifiedById(authenticatedUser.id)
      expect(userFound.id).toBe(authenticatedUser.id);
    })
  })

  describe('updateVerification', () => {
    it('should return an user with verification', async () => {
      const userUpdated = await UserService.updateVerification(user.id, 'user')
      expect(userUpdated.verifiedAt).toBeTruthy();
    })
    it('should return an user moderator', async () => {
      const userUpdated = await UserService.updateVerification(user.id, 'moderator')
      expect(userUpdated.role).toMatch('moderator');
    })
  })

  describe('updatePassword', () => {
    it('should return an user with new password', async () => {
      const HASH = await AuthService.hashPassword('123456789')
      const userUpdated = await UserService.updatePassword(user.id, HASH)
      expect(userUpdated.password).toMatch(HASH);
    })
  })

  describe('updateEmail', () => {
    it('should return the updated user', async () => {
      const emailToCompare = authenticatedUser.temporalEmail;
      const updatedUser = await UserService.updateEmail(authenticatedUser.id)
      expect(updatedUser.email).toEqual(emailToCompare)
    })
    it('should throw no request for email change', async () => {
      try {
        await UserService.updateEmail(authenticatedUserwithNoTemp.id)
      } catch (error) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('User haven\'t request an email change');
      }
    })
  })
  describe('createTemporalEmail', () => {
    it('should update the temporal email', async () => {
      expect.assertions(2);
      const updatedUser = await UserService.createTemporalEmail(authenticatedUserwithNoTemp.id, 'newemail@gmail.com')
      expect(updatedUser.temporalEmail).toMatch('newemail@gmail.com')
      expect(sgMail.send).toHaveBeenCalledTimes(1);
    })
    it('should throw email already in use', async () => {
      expect.assertions(2);
      try {
        await UserService.createTemporalEmail(authenticatedUserwithNoTemp.id, user.email)
      } catch (e) {
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][0],
        ).toBe(400);
        expect(
          (createHttpError as jest.MockedFunction<typeof createHttpError>).mock
            .calls[0][1],
        ).toMatch('email already in use');
      }
    })
  })
})