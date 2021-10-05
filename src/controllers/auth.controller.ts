import { PrismaClient } from ".prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Request, Response } from "express";
import { findByEmail, updatePassword } from "../services/user.service";
import { createToken, deleteToken, findHeaderToken, generateToken, updateToken, validatePassword, verifyToken } from "../services/auth.service";
import bcrypt from 'bcrypt'
import { jwtData } from "../utils/jwt.util";

const prisma = new PrismaClient();

const signup = async (req: Request, res: Response) => {
  const data = req.body

  try {
    const user = await prisma.user.create({ data })
    const token = await createToken({ id: user.id, role: user.role, type: 'verification' });
    return res.status(200).json({ token: token.token });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(400).send({ message: 'email already in use' })
    }

    console.log(e);

    return res.status(500).send({ message: 'there was an error' })
  }
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    return res.status(400).send({ message: 'email not registered' });
  }

  if (!user.verifiedAt) {
    return res.status(400).send({ message: 'email not verified' });
  }

  const passwordExists = await validatePassword(password, user.HASH)

  if (!passwordExists) {
    return res.status(400).send({ message: 'The email or password are wrong' });
  }

  const data: jwtData = { id: user.id, role: user.role, type: 'session' }

  if (user.role === 'user') {
    const account = await prisma.account.findFirst(
      {
        select: { id: true },
        where: {
          userId: user.id
        }
      }
    )
    data.accountId = account!.id;
  }

  const token = await createToken(data)

  return res.status(200).send(token);
}

const passwordRecover = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    return res.status(400).send({ message: 'email not registered' });
  }

  if (!user.verifiedAt) {
    return res.status(400).send({ message: 'email not verified' });
  }

  const token = await generateToken({ id: user.id, role: user.role, type: 'password' });

  return res.status(200).send({ token });
}

const passwordChange = async (req: Request, res: Response) => {
  const { token } = req.params
  const { password } = req.body
  const payload = await verifyToken(token)
  const HASH = await bcrypt.hash(password, 12)

  await updatePassword(payload.id, HASH);

  return res.status(200).send({ message: 'password updated' });
}

const logout = async (req: Request, res: Response) => {
  try {
    const tokenToDelete = await findHeaderToken(req);
    await deleteToken(tokenToDelete!.id)

    return res.status(200).send({ message: 'session ended' })
  } catch (e) {

    return res.status(500).send({ message: 'session couldn\' finish, try again' })
  }
}

const refreshToken = async (req: Request, res: Response) => {
  try {
    const tokenToRefresh = await findHeaderToken(req);
    const newToken = await updateToken(tokenToRefresh!.id, tokenToRefresh!.token)

    return res.status(200).send(newToken)
  } catch (e) {
    return res.status(500).send({ message: 'token couldn\' be updated, try again' })
  }
}

export { signup, login, passwordRecover, passwordChange, logout, refreshToken }