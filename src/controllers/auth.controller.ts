import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreateUserDto } from '../models/users/request/create-user.dto';
import { LoginUserDto } from '../models/users/request/login-user.dto';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

const signup = async (req: Request, res: Response): Promise<Response> => {
  const token = await AuthService.signup(plainToClass(CreateUserDto, req.body));

  return res.status(200).json(token);
};

const login = async (req: Request, res: Response): Promise<Response> => {
  const token = await AuthService.login(plainToClass(LoginUserDto, req.body));

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
  const token = await AuthService.recoverPassword(user);

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
