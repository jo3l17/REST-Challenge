import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'

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

export { hashPassword, loginCheck }