import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import authService from '../services/auth.service';
import userService from '../services/user.service';

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
  let payload;
  try {
    payload = await authService.verifyToken(token, 'session');
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(498).json({ message: 'token expired' });
    }
    return res.status(500).json({ message: 'token error' });
  }

  if (payload.type !== 'session') {
    return res
      .status(500)
      .json({ message: 'not a session token, login again' });
  }

  const user = await userService.findById(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'no user' });
  }

  req.user = { ...user, accountId: payload.accountId || null };
  next();
};

export { protect };
