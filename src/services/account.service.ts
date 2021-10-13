import { Account, PrismaClient } from '.prisma/client';
import createHttpError from 'http-errors';
import {
  accountData,
  patchAccountModel,
  resAccountModel,
} from '../models/account.model';
import { AccountDto } from '../models/account/response/account.dto';

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

  static findOne = async (userId: number): Promise<resAccountModel | null> => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        userId,
      },
    });

    return account;
  };

  static findByUserId = async (userId: number): Promise<resAccountModel> => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        userId,
      },
    });

    if (!account) {
      throw createHttpError(404, 'no account found');
    }

    return account;
  };

  static findById = async (id: number): Promise<AccountDto> => {
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

  static update = async (id: number, data: patchAccountModel): Promise<AccountDto> => {
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
