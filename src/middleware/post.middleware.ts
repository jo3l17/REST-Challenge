import { PrismaClient, Role } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

const verifyOwner = async (req: Request, res: Response, next: NextFunction) => {
  const currentId = req.body.user.accountId;

  const postId = parseInt(req.params.id);
  const ownerId = prisma.post.findUnique({
    select: { accountId: true },
      where: {
        id: postId,
      }
    })

  if (ownerId !== currentId) {
    res.status(400).send("Post's action refused");
  }

  next();
}

const verifyRole = async (req: Request, res: Response, next: NextFunction) => {
  const currentRole = req.body.user.role;

  if (currentRole !== Role.moderator) {
    res.status(400).send("Post's action refused");
  }

  next();
}

export {verifyOwner, verifyRole}