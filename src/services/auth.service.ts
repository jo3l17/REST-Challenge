import bcrypt from 'bcrypt';
import {
  expiresIn,
  jwtData,
  jwtPayload,
  secret,
  sessionType,
} from '../utils/jwt.util';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { PrismaClient, User } from '.prisma/client';
import { Request } from 'express';
import { tokenData, tokenModel } from '../models/token.model';
import userService from './user.service';
import createHttpError from 'http-errors';
import accountService from './account.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { createEmail, sgMail } from '../utils/sendgrid.util';
import { userModel } from '../models/user.model';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../models/users/request/create-user.dto';
const prisma = new PrismaClient();

class AuthService {
  static validatePassword = async (
    dataPassword: string,
    userPassword: string,
  ) => {
    return await bcrypt.compare(dataPassword, userPassword);
  };

  static createToken = async (data: jwtData): Promise<tokenModel> => {
    if (data.role === 'user' && data.type === 'session') {
      const account = await accountService.findByUserId(data.id);
      data.accountId = account!.id;
    }
    const token = this.generateToken(data);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const prismaToken = await prisma.token.create({
      ...tokenData,
      data: {
        token,
        userId: data.id,
        expirationDate: date,
      },
    });

    return prismaToken;
  };

  static generateToken = (
    data: jwtData,
    expires: string = expiresIn,
  ): string => {
    const token = jwt.sign(data, secret, { expiresIn: expires });

    return token;
  };

  static verifyToken = async (token: string, type: sessionType = 'session') => {
    try {
      const verifiedToken = jwt.verify(token, secret) as jwtPayload;
      if (verifiedToken.type !== type) {
        throw createHttpError(400, 'invalid token');
      }

      return verifiedToken;
    } catch (e) {
      console.log(e);
      if (e instanceof TokenExpiredError) {
        if (type === 'verification') {
          await this.sendNewVerification(token);
          throw createHttpError(100, 'token expired, new token sent to email');
        }

        throw createHttpError(498, 'token expired');
      }
      throw createHttpError(500, 'token error');
    }
  };

  static sendNewVerification = async (token: string) => {
    const tokenToUpdate = await this.findToken(token);
    const user = await userService.findById(tokenToUpdate.userId);
    const newToken = await this.updateToken(tokenToUpdate.id, user.id);
    const msg = createEmail(
      user.email,
      `token signup`,
      `Hello ${user.name} use patch to this url to verify your account`,
      `http://localhost:3000/users/${newToken.token}/verify`,
      newToken.token,
    );

    try {
      await sgMail.send(msg);
    } catch (e) {
      throw createHttpError(500, 'there was an Error sending the email');
    }
  };

  static deleteToken = async (id: number) => {
    const deleteToken = await prisma.token.delete({
      where: {
        id,
      },
    });

    return deleteToken;
  };

  static deleteTokenByUserId = async (userId: number) => {
    const deleteToken = await prisma.token.deleteMany({
      where: {
        userId,
      },
    });

    return deleteToken;
  };

  static validateSignupData = async (data: User, password: string) => {
    if (!data.email || !password || !data.name) {
      throw createHttpError(400, 'email, name and password required');
    }
    try {
      const HASH = await this.hashPassword(password);
      const dto = plainToClass(CreateUserDto, { ...data, password: HASH })
      const user = await userService.create(dto);
      const token = await this.createToken({
        id: user.id,
        role: user.role,
        type: 'verification',
      });
      const msg = createEmail(
        data.email,
        `token signup`,
        `Hello ${data.name} use patch to this url to verify your account`,
        `http://localhost:3000/users/${token.token}/verify`,
        token.token,
      );

      await sgMail.send(msg);

      return token;
    } catch (e) {
      console.log(e);
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw createHttpError(400, 'email already in use');
      }
      throw createHttpError(500, 'there was an error');
    }
  };

  static validateLoginData = async (email: string, password: string) => {
    if (!email || !password) {
      throw createHttpError(400, 'Email, and Password required');
    }

    const user = await userService.findByEmail(email);

    if (!user) {
      throw createHttpError(400, 'email not registered');
    }

    if (!user.verifiedAt) {
      throw createHttpError(400, 'email not verified');
    }

    const passwordExists = await this.validatePassword(password, user.password);

    if (!passwordExists) {
      throw createHttpError(400, 'The email or password are wrong');
    }

    const data: jwtData = { id: user.id, role: user.role, type: 'session' };

    const token = await this.createToken(data);

    return token;
  };

  static recoverPasswordService = async (user: userModel) => {
    const token = this.generateToken({
      id: user.id,
      role: user.role,
      type: 'password',
    });
    const msg = createEmail(
      user.email,
      `Password Recover`,
      `Hello ${user.name} use patch to this url to change you password with your new password`,
      `http://localhost:3000/users/passwords/${token}`,
      token,
    );
    await sgMail.send(msg);

    return token;
  };

  static hashPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  };

  static findHeaderToken = async (req: Request) => {
    const headerToken = req.headers.authorization!.split('Bearer ')[1].trim();
    const token = await prisma.token.findFirst({
      select: {
        ...tokenData.select,
        id: true,
      },
      where: {
        token: headerToken,
      },
    });
    if (!token) {
      throw createHttpError(404, 'no token found');
    }

    return token;
  };

  static findToken = async (token: string) => {
    const tokenRes = await prisma.token.findFirst({
      select: {
        ...tokenData.select,
        id: true,
      },
      where: {
        token,
      },
    });
    if (!tokenRes) {
      throw createHttpError(404, 'no token found');
    }

    return tokenRes;
  };

  static updateToken = async (
    id: number,
    userId: number,
    type: sessionType = 'session',
  ) => {
    const user = await userService.findById(userId);
    const account = await accountService.findByUserId(userId, true);
    const data: jwtData = {
      id: id,
      role: user.role,
      type,
    };

    if (account) {
      data.accountId = account.id;
    }

    const newToken = this.generateToken(data);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const updatedToken = await prisma.token.update({
      ...tokenData,
      where: {
        id,
      },
      data: {
        token: newToken,
        expirationDate: date,
      },
    });

    return updatedToken;
  };
}

export default AuthService;
