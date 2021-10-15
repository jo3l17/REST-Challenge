import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'no auth' });
  }

  const token = bearer.split('Bearer ')[1].trim();
  const payload = await AuthService.verifyToken(token, 'session');
  const user = await UserService.findById(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'no user' });
  }

  req.user = { ...user };
  if (payload.accountId) {
    req.accountId = payload.accountId;
  }
  next();
};

export { protect };
