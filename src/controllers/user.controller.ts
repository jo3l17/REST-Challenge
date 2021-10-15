import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

const getUser = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id) || req.body.user.id;
  const user = await UserService.findById(id);

  return res.status(200).json(user);
};

const verifyUser = async (req: Request, res: Response): Promise<Response> => {
  const token = req.params.token;
  const payload = await AuthService.verifyToken(token, 'verification');
  await UserService.updateVerification(payload.id, payload.role);

  return res.status(200).json({ message: 'user verified' });
};

const emailChange = async (req: Request, res: Response): Promise<Response> => {
  const id = req.body.user.id;
  const { email } = req.body;
  await UserService.createTemporalEmail(id, email);

  return res.status(200).json({ message: 'Please verify your new email' });
};

const verifyNewEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const token = req.params.token;
  const payload = await AuthService.verifyToken(token, 'email');
  await UserService.updateEmail(payload.id);

  return res.status(200).json({ message: 'email changed' });
};

export { getUser, verifyUser, emailChange, verifyNewEmail };
