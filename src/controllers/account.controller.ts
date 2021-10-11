import { Request, Response } from "express";
import accountService from "../services/account.service";

const getAccount = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id) || req.body.user.accountId
  const account = await accountService.findById(id);

  return res.status(200).send(account);
}

const updateAccount = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id) || req.body.user.accountId
  const { isNamePublic, isEmailPublic } = req.body
  const account = await accountService.updateAccount(id, { isNamePublic, isEmailPublic });

  return res.status(200).send(account);
}

export { getAccount, updateAccount }
