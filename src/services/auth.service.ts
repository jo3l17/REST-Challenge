import bcrypt from 'bcrypt';
import {
  expiresIn,
  jwtData,
  jwtPayload,
  secret,
  sessionType,
} from '../utils/jwt.util';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Prisma, PrismaClient, Token } from '.prisma/client';
import { Request } from 'express';
import userService from './user.service';
import createHttpError from 'http-errors';
import accountService from './account.service';
import { createEmail, sgMail } from '../utils/sendgrid.util';
import { CreateUserDto } from '../models/users/request/create-user.dto';
import { TokenResponseDto } from '../models/token/response/token-response.dto';
import { LoginUserDto } from '../models/users/request/login-user.dto';
import { TokenModelDto } from '../models/token/response/token-model.dto';
import { UserDto } from '../models/users/response/user.dto';
const prisma = new PrismaClient();

class AuthService {
  static validatePassword = async (
    dataPassword: string,
    userPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(dataPassword, userPassword);
  };

  static createToken = async (data: jwtData): Promise<TokenResponseDto> => {
    if (data.role === 'user' && data.type === 'session') {
      const account = await accountService.findByUserId(data.id);
      data.accountId = account?.id;
    }
    const token = this.generateToken(data);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const prismaToken = await prisma.token.create({
      select: {
        token: true,
        expirationDate: true,
        userId: true,
      },
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

  static verifyToken = async (token: string, type: sessionType = 'session'): Promise<jwtPayload> => {
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

  static sendNewVerification = async (token: string): Promise<void> => {
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
    await sgMail.send(msg);
  };

  static deleteToken = async (id: number): Promise<Token> => {
    const deletedToken = await prisma.token.delete({
      where: {
        id,
      },
    });

    return deletedToken;
  };

  static deleteTokenByUserId = async (userId: number): Promise<Prisma.BatchPayload> => {
    const deletedTokens = await prisma.token.deleteMany({
      where: {
        userId,
      },
    });

    return deletedTokens;
  };

  static uniqueEmail = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) return false;
    return true;
  }

  static signup = async (data: CreateUserDto): Promise<TokenResponseDto> => {
    const validEmail = await this.uniqueEmail(data.email);
    if (!validEmail) {
      throw createHttpError(400, 'This email is already registered');
    }
    const user = await userService.create(data);

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
  };

  static login = async (data: LoginUserDto): Promise<TokenResponseDto> => {
    const user = await userService.findByEmail(data.email);
    const passwordExists = await this.validatePassword(data.password, user.password);
    if (!passwordExists) {
      throw createHttpError(400, 'The email or password are wrong');
    }
    const tokenData: jwtData = { id: user.id, role: user.role, type: 'session' };
    const account = await accountService.findByUserId(user.id);
    let token
    if (account) {
      tokenData.accountId = account.id;
    }

    token = await this.createToken(tokenData);
    return token;

  };

  static recoverPassword = async (user: UserDto): Promise<string> => {
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

  static hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  };

  static findHeaderToken = async (req: Request): Promise<TokenModelDto> => {
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith('Bearer ')) {
      throw createHttpError(401, 'no auth');
    }

    const headerToken = bearer.split('Bearer ')[1].trim();
    const token = await prisma.token.findFirst({
      select: {
        token: true,
        expirationDate: true,
        userId: true,
        id: true
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

  static findToken = async (token: string): Promise<TokenModelDto> => {
    const tokenRes = await prisma.token.findFirst({
      select: {
        id: true,
        token: true,
        expirationDate: true,
        userId: true,
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
  ): Promise<TokenResponseDto> => {
    const user = await userService.findById(userId);
    const account = await accountService.findByUserId(userId);
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
      select: {
        token: true,
        expirationDate: true,
        userId: true,
      },
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
