import { PrismaClient, Role, User } from '.prisma/client';
import createHttpError from 'http-errors';
import { userPersonalData } from '../models/user.model';
import { CreateUserDto } from '../models/users/request/create-user.dto';
import { UserMiddlewareDto } from '../models/users/response/user-middleware.dto';
import { UserDto } from '../models/users/response/user.dto';
import { createEmail, HOST, PORT, sgMail } from '../utils/sendgrid.util';
import accountService from './account.service';
import AuthService from './auth.service';
import authService from './auth.service';
const prisma = new PrismaClient();

class UserService {
  static create = async (data: CreateUserDto): Promise<User> => {
    const HASH = await AuthService.hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: HASH,
      },
    });
    return user;
  };

  static findByEmail = async (email: string): Promise<UserDto> => {
    const user = await prisma.user.findUnique({
      where: { email },
      rejectOnNotFound: true,
    });

    if (!user.verifiedAt) {
      throw createHttpError(400, 'email not verified');
    }

    return user;
  };

  static findById = async (id: number): Promise<UserMiddlewareDto> => {
    const user = await prisma.user.findUnique({
      ...userPersonalData,
      where: { id },
      rejectOnNotFound: true,
    });
    return user;
  };

  static findVerifiedById = async (id: number): Promise<UserDto> => {
    const user = await prisma.user.findFirst({
      ...userPersonalData,
      where: {
        id,
        NOT: [
          {
            verifiedAt: null,
          },
        ],
      },
      rejectOnNotFound: true,
    });
    return user;
  };

  static updateVerification = async (id: number, role: Role): Promise<User> => {
    const user = await prisma.user.update({
      where: { id },
      data: {
        verifiedAt: new Date(),
      },
    });
    await authService.deleteTokenByUserId(id);
    if (role === 'user') {
      await accountService.create(id);
    }
    return user;
  };

  static updatePassword = async (
    id: number,
    password: string,
  ): Promise<User> => {
    const user = await prisma.user.update({
      where: { id },
      data: { password },
    });
    return user;
  };

  static updateEmail = async (id: number): Promise<User> => {
    const user = await this.findVerifiedById(id);
    if (!user.temporalEmail) {
      throw createHttpError(400, "User haven't request an email change");
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: user.temporalEmail,
        temporalEmail: null,
      },
    });
    return updatedUser;
  };

  static createTemporalEmail = async (
    id: number,
    temporalEmail: string,
  ): Promise<UserDto> => {
    const user = await this.findVerifiedById(id);
    const validEmail = await AuthService.uniqueEmail(temporalEmail);
    if (!validEmail) {
      throw createHttpError(400, 'email already in use');
    }
    const updatedUser = await prisma.user.update({
      ...userPersonalData,
      where: { id: user.id },
      data: { temporalEmail },
    });
    const token = await authService.generateToken({
      id: user.id,
      role: user.role,
      type: 'email',
    });
    const msg = createEmail(
      temporalEmail,
      `Email change`,
      `Hello ${user.name} use patch to this url to verify your new email`,
      `http://${HOST}${PORT ? `:${PORT}` : ''}/users/email/${token}`,
      token,
    );
    await sgMail.send(msg);
    return updatedUser;
  };
}

export default UserService;
