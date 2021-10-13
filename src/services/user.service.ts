import { PrismaClient, User } from '.prisma/client';
import createHttpError from 'http-errors';
import { userModel, userPersonalData } from '../models/user.model';
import { CreateUserDto } from '../models/users/request/create-user.dto';
import { UserMiddlewareDto } from '../models/users/response/user-middleware.dto';
import { UserDto } from '../models/users/response/user.dto';
import { createEmail, sgMail } from '../utils/sendgrid.util';
import accountService from './account.service';
import AuthService from './auth.service';
import authService from './auth.service';
const prisma = new PrismaClient();

class UserService {
  static create = async (data: CreateUserDto): Promise<User> => {
    const HASH = await AuthService.hashPassword(data.password);
    const user = await prisma.user.create({ data: { ...data, password: HASH } });
    return user;
  };

  static findByEmail = async (email: string): Promise<UserDto> => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createHttpError(404, 'no user found');
    }

    if (!user.verifiedAt) {
      throw createHttpError(400, 'email not verified');
    }

    return user;
  };

  static findAnyByEmail = async (email: string): Promise<userModel | null> => {
    const user = await prisma.user.findUnique({
      select: {
        ...userPersonalData.select,
        password: true,
      },
      where: { email },
    });

    return user;
  };

  static findById = async (id: number): Promise<UserMiddlewareDto> => {
    const user = await prisma.user.findUnique({
      ...userPersonalData,
      where: { id },
    });
    if (!user) {
      throw createHttpError(404, 'no user found');
    }
    return user;
  };

  static findVerifiedById = async (id: number): Promise<userModel> => {
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
    });
    if (!user) {
      throw createHttpError(404, 'user not verified');
    }
    return user;
  };

  static updateVerification = async (
    id: number,
    role: string,
  ): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: {
        verifiedAt: new Date(),
      },
    });
    await authService.deleteTokenByUserId(id);
    if (role === 'user') {
      await accountService.create(id);
    }
  };

  static updatePassword = async (id: number, password: string): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: { password },
    });
  };

  static updateEmail = async (id: number): Promise<void> => {
    const user = await this.findVerifiedById(id);
    if (!user.temporalEmail) {
      throw createHttpError(400, "User haven't request an email change");
    }
    await prisma.user.update({
      where: { id },
      data: {
        email: user.temporalEmail,
        temporalEmail: null,
      },
    });
  };

  static createTemporalEmail = async (
    id: number,
    temporalEmail: string,
  ): Promise<userModel> => {
    const user = await this.findVerifiedById(id);
    const existingUser = await this.findAnyByEmail(temporalEmail);
    if (existingUser) {
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
      `http://localhost:3000/users/email/${token}`,
      token,
    );
    await sgMail.send(msg);
    return updatedUser;
  };
}

export default UserService;
