import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import AccountService from '../services/account.service';

const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const account = await AccountService.findById(parseInt(req.params.accountId));

  if (!account) {
    throw createHttpError(404, 'Account not found');
  }

  next();
};

export { verifyAccount };
