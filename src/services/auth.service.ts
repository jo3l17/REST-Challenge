import bcrypt from 'bcrypt';
import { expiresIn, jwtData, jwtPayload, secret } from '../utils/jwt.util';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { PrismaClient } from '.prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

const validatePassword = async (dataPassword: string, userPassword: string) => {
  return await bcrypt.compare(dataPassword, userPassword)
}

const createToken = async (data: jwtData) => {
  const token = generateToken(data);
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const prismaToken = await prisma.token.create({
    select: {
      token: true,
      expirationDate: true
    },
    data: {
      token,
      userId: data.id,
      expirationDate: date
    }
  })
  return prismaToken
}

const generateToken = (data: jwtData, expires: string = expiresIn) => {
  const token = jwt.sign(data, secret, { expiresIn: expires })
  return token;
}

const verifyToken = async (token: string, req: Request, res: Response): Promise<jwtPayload> => {
  const verifiedToken = (await jwt.verify(token, secret)) as jwtPayload
  return verifiedToken
}

export { validatePassword, createToken, generateToken, verifyToken }