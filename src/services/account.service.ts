import { Account, PrismaClient } from '.prisma/client';
import createHttpError from 'http-errors';
import {
  accountData
} from '../models/account.model';
import { UpdateAccountDto } from '../models/account/request/update-account.dto';
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

  static findByUserId = async (userId: number | undefined): Promise<AccountDto | null> => {
    const account = await prisma.account.findUnique({
      ...accountData,
      where: {
        userId,
      },
    });

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

  static update = async (id: number, data: UpdateAccountDto): Promise<AccountDto> => {
    const account = await this.findById(id);

    const updatedAccount = await prisma.account.update({
      ...accountData,
      where: {
        id:account.id,
      },
      data,
    });

    return updatedAccount;
  };
}

export default AccountService;
