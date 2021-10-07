import { Request, Response } from "express";
import userService from "../services/user.service";
import { deleteToken, findHeaderToken, generateToken, hashPassword, updateToken, validateLoginData, validateSignupData, verifyToken } from "../services/auth.service";

const signup = async (req: Request, res: Response) => {
  const data = req.body
  const password = req.body.password
  delete data.password;
  const token = await validateSignupData(data, password)

  return res.status(200).send(token);
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await validateLoginData(email, password);

  return res.status(200).send(token);
}

const logout = async (req: Request, res: Response) => {
  const tokenToDelete = await findHeaderToken(req);
  await deleteToken(tokenToDelete.id)

  return res.status(200).send({ message: 'session ended' })
}

const passwordRecover = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);
  const token = generateToken({ id: user.id, role: user.role, type: 'password' });

  return res.status(200).send({ token });
}

const passwordChange = async (req: Request, res: Response) => {
  const { token } = req.params
  const { password } = req.body
  const payload = await verifyToken(token)
  const HASH = await hashPassword(password);

  await userService.updatePassword(payload.id, HASH);

  return res.status(200).send({ message: 'password updated' });
}

const refreshToken = async (req: Request, res: Response) => {
  const tokenToRefresh = await findHeaderToken(req);
  const newToken = await updateToken(tokenToRefresh.id, tokenToRefresh.token)

  return res.status(200).send(newToken)
}

export { signup, login, passwordRecover, passwordChange, logout, refreshToken }