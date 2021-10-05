import bcrypt from 'bcrypt';
import { expiresIn, jwtData, jwtPayload, secret } from '../utils/jwt.util';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '.prisma/client';
import { Request } from 'express';
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
  const verifiedToken = jwt.verify(token, secret) as jwtPayload
  return verifiedToken
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

const findHeaderToken = async (req: Request) => {
  const headerToken = req.headers.authorization!.split('Bearer ')[1].trim()
  const token = await prisma.token.findFirst({ select: { id: true, token: true }, where: { token: headerToken } })
  return token;
}

const updateToken = async (id: number, token: string) => {
  const tokenData = await getTokenData(token);
  const data: jwtData = {
    id: tokenData.id,
    role: tokenData.role,
    type: tokenData.type,
  }

  if (tokenData.accountId) {
    data.accountId = tokenData.accountId
  }

  const newToken = generateToken(data);
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const updatedToken = await prisma.token.update({
    select: {
      token: true,
      expirationDate: true
    },
    where: {
      id
    },
    data: {
      token: newToken,
      expirationDate: date,
    }
  })
  return updatedToken
}

export { validatePassword, createToken, generateToken, verifyToken, deleteToken, findHeaderToken, updateToken }