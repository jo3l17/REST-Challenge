import { PrismaClient } from ".prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Request, Response } from "express";
import { findOne } from "../services/user.service";
import { createToken, validatePassword } from "../services/auth.service";

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
  const user = await findOne(data.email);

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

export { signup, login }