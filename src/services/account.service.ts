import { Account, PrismaClient } from '.prisma/client';
import createHttpError from 'http-errors';
import {
  accountData,
  patchAccountModel,
  resAccountModel,
} from '../models/account.model';

const prisma = new PrismaClient();

class AccountService {
  static create = async (userId: number): Promise<Account> => {
    const account = await prisma.account.create({
      data: {
        user: {
          connect: { id: userId },
        },
      },
    });

    return account;
  };

  static findByUserId = async (
    userId: number,
    returnEmpty = false,
  ): Promise<resAccountModel> => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        userId,
      },
    });

    if (!account && !returnEmpty) {
      throw createHttpError(404, 'no account found');
    }

    return account!;
  };

  static findById = async (id: number) => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        id,
      },
    });

    if (!account) {
      throw createHttpError(404, 'no account found');
    }

    return account;
  };

  static update = async (id: number, data: patchAccountModel) => {
    const updatedAccount = await prisma.account.update({
      ...accountData,
      where: {
        id,
      },
      data,
    });

    if (!updatedAccount) {
      throw createHttpError(404, 'no account found');
    }

    return updatedAccount;
  };
}

export default AccountService;
