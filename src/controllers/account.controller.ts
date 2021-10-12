import { Request, Response } from 'express';
import AccountService from '../services/account.service';

const getAccount = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id) || req.user.accountId;
  const account = await AccountService.findById(id);

  return res.status(200).json(account);
};

const updateAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const id = parseInt(req.params.id) || req.user.accountId;
  const { isNamePublic, isEmailPublic } = req.body;
  const account = await AccountService.update(id, {
    isNamePublic,
    isEmailPublic,
  });

  return res.status(200).json(account);
};

export { getAccount, updateAccount };
