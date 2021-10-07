import { PrismaClient, User } from ".prisma/client";
import createHttpError from "http-errors";
import { userPersonalData } from "../models/user.model";
import accountService from "./account.service";
const prisma = new PrismaClient();

class userService {
  static create = async (data: User) => {
    const user = await prisma.user.create({ data })
    return user;
  }

  static findByEmail = async (email: string) => {
    const user = await prisma.user.findUnique(
      {
        select: {
          ...userPersonalData.select,
          HASH: true
        },
        where: { email }
      }
    )

    if (!user) {
      throw createHttpError(404, 'no user found')
    }

    if (!user.verifiedAt) {
      throw createHttpError(400, 'email not verified')
    }

    return user;
  }

  static findById = async (id: number) => {
    const user = await prisma.user.findUnique(
      {
        ...userPersonalData,
        where: { id }
      }
    )
    if (!user) {
      throw createHttpError(404, 'no user found')
    }
    return user;
  }

  static updateVerification = async (id: number, role: string) => {
    await prisma.user.update(
      {
        where: { id },
        data: {
          verifiedAt: new Date()
        }
      }
    )
    if (role === 'user') {
      await accountService.create(id)
    }
  }

  static updatePassword = async (id: number, HASH: string) => {
    await prisma.user.update(
      {
        where: { id },
        data: { HASH }
      }
    )
  }
}



export default userService