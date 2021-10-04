import { PrismaClient } from ".prisma/client";
import { Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verifyToken } from "../services/auth.service";
import { findById, updateVerification } from "../services/user.service";
const prisma = new PrismaClient();

const verifyUser = async (req: Request, res: Response) => {
  const token = req.params.token
  try {
    const payload = await verifyToken(token);
    await updateVerification(payload.id);
    if (payload.role === 'user') {
      const account = await prisma.account.create({ data: { userId: payload.id } })
    }
    return res.status(400).send({ message: 'user verified' });
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(500).send({ message: 'token expired' })
    }
    return res.status(500).send({ message: 'token error' })
  }
}

const getUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id) || req.body.user.id
  const user = await findById(parseInt(id));
  if (!user) {
    return res.status(404).send({ message: 'no user found' });
  }
  return res.status(200).send(user);
}

export { verifyUser, getUser }
