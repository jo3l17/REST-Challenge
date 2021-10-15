import { Role } from ".prisma/client";

const secret = process.env.SECRET_JWT_KEY || 'ravn_nerdery';
const expiresIn = '1h';

type jwtData = {
  id: number;
  role: Role;
  type: sessionType;
  accountId?: number;
};

type jwtPayload = {
  id: number;
  role: Role;
  type: sessionType;
  accountId?: number;
  iat: number;
  exp: number;
};

type sessionType = 'session' | 'password' | 'email' | 'verification';

export { secret, expiresIn, jwtData, jwtPayload, sessionType };
