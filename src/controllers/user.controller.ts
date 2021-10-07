import { Request, Response } from "express";
import { verifyToken } from "../services/auth.service";
import userService from "../services/user.service";

const getUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id) || req.body.user.id
  const user = await userService.findById(id);

  return res.status(200).send(user);
}

const verifyUser = async (req: Request, res: Response) => {
  const token = req.params.token
  const payload = await verifyToken(token);
  await userService.updateVerification(payload.id, payload.role);

  return res.status(400).send({ message: 'user verified' });
}

export { getUser, verifyUser }