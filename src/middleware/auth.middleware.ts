import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import { verifyToken } from "../services/auth.service";
import { TokenExpiredError } from "jsonwebtoken";
import { findById } from "../services/user.service";

const hashPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password, name, email } = req.body
  if (!name || !email || !password) {
    res.status(400).send({ message: 'Email, Name, and Password required' })
  }
  const hashedPassword = await bcrypt.hash(password, 12)
  req.body = { name, email, HASH: hashedPassword }
  next()
}

const loginCheck = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;
  if (!data.email || !data.password) {
    return res.status(400).send({ message: 'email and password required' })
  }
  next();
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'no auth' })
  }

  const token = bearer.split('Bearer ')[1].trim()
  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(500).send({ message: 'token expired' })
    }
    return res.status(500).send({ message: 'token error' })
  }

  if (payload.type !== 'session') {
    return res.status(500).send({ message: 'not a session token, login again' })
  }

  const user = await findById(payload.id)
  if (!user) {
    return res.status(401).send({ message: 'no user' })
  }
  req.body.user = {...user, accountId: payload.accountId};
  next();
}

export { hashPassword, loginCheck, protect }