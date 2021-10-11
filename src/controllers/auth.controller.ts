import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

const signup = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body;
  const password = req.body.password;
  delete data.password;
  const token = await AuthService.validateSignupData(data, password);

  return res.status(200).json(token);
};

const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  const token = await AuthService.validateLoginData(email, password);

  return res.status(200).json(token);
};

const logout = async (req: Request, res: Response): Promise<Response> => {
  const tokenToDelete = await AuthService.findHeaderToken(req);
  await AuthService.deleteToken(tokenToDelete.id);

  return res.status(200).json({ message: 'session ended' });
};

const passwordRecover = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { email } = req.body;
  const user = await UserService.findByEmail(email);
  const token = await AuthService.recoverPasswordService(user);

  return res.status(200).json({ token });
};

const passwordChange = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { token } = req.params;
  const { password } = req.body;
  const payload = await AuthService.verifyToken(token, 'password');
  const HASH = await AuthService.hashPassword(password);

  await UserService.updatePassword(payload.id, HASH);

  return res.status(200).json({ message: 'password updated' });
};

const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  const tokenToRefresh = await AuthService.findHeaderToken(req);
  const newToken = await AuthService.updateToken(
    tokenToRefresh.id,
    tokenToRefresh.userId,
  );

  return res.status(200).json(newToken);
};

export { signup, login, passwordRecover, passwordChange, logout, refreshToken };
