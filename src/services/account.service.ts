import { PrismaClient } from ".prisma/client";
import createHttpError from "http-errors";
import { accountData } from "../models/account.model";

const prisma = new PrismaClient();

class accountService {
  static create = async (userId: number) => {
    const account = await prisma.account.create(
      {
        data: {
          user: {
            connect: { id: userId }
          }
        }
      }
    )

    return account
  }

  static findByUserId = async (userId: number) => {
    const account = await prisma.account.findUnique(
      {
        ...accountData,
        where: {
          userId
        }
      }
    )

    if (!account) {
      throw createHttpError(404, 'no account found');
    }

    return account
  }

  static findById = async (id: number) => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        id
      }
    })

    if (!account) {
      throw createHttpError(404, 'no account found');
    }

    return account;
  }
}

export default accountService