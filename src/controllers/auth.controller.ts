import { PrismaClient, User } from ".prisma/client"
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body
  try {
    const user = await prisma.user.create({ data })
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(500).send("there was an error")
  }
}


export { createUser }