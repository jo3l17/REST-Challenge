import bcrypt from 'bcrypt';
import { expiresIn, jwtData, jwtPayload, secret } from '../utils/jwt.util';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { PrismaClient, User } from '.prisma/client';
import { Request } from 'express';
import { tokenData } from '../models/token.model';
import userService from './user.service';
import createHttpError from 'http-errors'
import accountService from './account.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
const prisma = new PrismaClient();

const validatePassword = async (dataPassword: string, userPassword: string) => {
  return await bcrypt.compare(dataPassword, userPassword)
}

const createToken = async (data: jwtData) => {
  if (data.role === 'user') {
    const account = await accountService.findByUserId(data.id)
    data.accountId = account!.id;
  }
  const token = generateToken(data);
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const prismaToken = await prisma.token.create({
    ...tokenData,
    data: {
      token,
      userId: data.id,
      expirationDate: date,
    }
  })
  return prismaToken
}

const generateToken = (data: jwtData, expires: string = expiresIn) => {
  const token = jwt.sign(data, secret, { expiresIn: expires })
  return token;
}

const verifyToken = (token: string): jwtPayload => {
  try {
    const verifiedToken = jwt.verify(token, secret) as jwtPayload
    return verifiedToken
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      throw createHttpError(500, 'token expired')
    }
    throw createHttpError(500, 'token error')
  }
}

const getTokenData = (token: string) => {
  const decodedToken = jwt.decode(token) as jwtPayload
  return decodedToken
}

const deleteToken = async (id: number) => {
  const deleteToken = await prisma.token.delete({
    where: {
      id
    }
  })

  return deleteToken;
}

const validateSignupData = async (data: User, password: string) => {
  if (!data.email || !password || !data.name) {
    throw createHttpError(400, 'email, name and password required')
  }
  try {
    const HASH = await hashPassword(password);
    const user = await userService.create({ ...data, HASH });
    const token = await createToken({ id: user.id, role: user.role, type: 'verification' });

    return token
  } catch (e) {
    console.log(e);
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      throw createHttpError(400, 'email already in use')
    }
    throw createHttpError(500, 'there was an error')
  }
}

const validateLoginData = async (email: string, password: string) => {

  if (!email || !password) {
    throw createHttpError(400, 'Email, and Password required')
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw createHttpError(400, 'email not registered')
  }

  if (!user.verifiedAt) {
    throw createHttpError(400, 'email not verified')
  }

  const passwordExists = await validatePassword(password, user.HASH)

  if (!passwordExists) {
    throw createHttpError(400, 'The email or password are wrong');
  }

  const data: jwtData = { id: user.id, role: user.role, type: 'session' }

  const token = await createToken(data)

  return token
}

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 12)
  return hashedPassword;
}

const findHeaderToken = async (req: Request) => {
  const headerToken = req.headers.authorization!.split('Bearer ')[1].trim()
  const token = await prisma.token.findFirst(
    {
      select: {
        ...tokenData.select,
        id: true
      },
      where: {
        token: headerToken
      }
    }
  )
  if (!token) {
    throw createHttpError(404, 'no token found')
  }

  return token;
}

const updateToken = async (id: number, token: string) => {
  const payload = await getTokenData(token);
  const data: jwtData = {
    id: payload.id,
    role: payload.role,
    type: payload.type,
  }

  if (payload.accountId) {
    data.accountId = payload.accountId
  }

  const newToken = generateToken(data);
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const updatedToken = await prisma.token.update(
    {
      ...tokenData,
      where: {
        id
      },
      data: {
        token: newToken,
        expirationDate: date,
      },
    }
  )
  return updatedToken
}

export {
  validatePassword,
  createToken,
  generateToken,
  verifyToken,
  deleteToken,
  findHeaderToken,
  updateToken,
  validateSignupData,
  validateLoginData,
  hashPassword
}