import { PrismaClient } from ".prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Request, Response } from "express";
import { findByEmail, updatePassword } from "../services/user.service";
import { createToken, generateToken, validatePassword, verifyToken } from "../services/auth.service";
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

const signup = async (req: Request, res: Response) => {
  const data = req.body

  try {
    const user = await prisma.user.create({ data })
    const token = await createToken({ id: user.id, role: user.role });
    return res.status(200).json({ token: token.token });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(400).send({ message: 'email already in use' })
    }

    console.log(e);

    return res.status(500).send('there was an error')
  }
}

const login = async (req: Request, res: Response) => {
  const data = req.body;
  const user = await findByEmail(data.email);

  if (!user) {
    return res.status(400).send({ message: 'email not registered' });
  }

  if (!user.verifiedAt) {
    return res.status(400).send({ message: 'email not verified' });
  }

  const passwordExists = await validatePassword(data.password, user.HASH)

  if (!passwordExists) {
    return res.status(400).send({ message: 'The email or password are wrong' });
  }

  const token = await createToken({ id: user.id, role: user.role })

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

  const token = await generateToken({ id: user.id, role: user.role });

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

export { signup, login, passwordRecover, passwordChange }