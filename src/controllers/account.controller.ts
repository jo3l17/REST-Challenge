import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { UpdateAccountDto } from '../models/account/request/update-account.dto';
import AccountService from '../services/account.service';

const getAccount = async (req: Request, res: Response): Promise<Response> => {
  let id = req.accountId || parseInt(req.params.id);
  if (req.params.id) {
    id = parseInt(req.params.id);
  }
  const account = await AccountService.findById(id);

  return res.status(200).json(account);
};

const updateAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const id = req.accountId;
  const data = plainToClass(UpdateAccountDto, req.body);
  await data.isValid();
  const account = await AccountService.update(id, data);

  return res.status(200).json(account);
};

export { getAccount, updateAccount };
