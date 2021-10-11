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
  const payload = await verifyToken(token, 'verification');
  await userService.updateVerification(payload.id, payload.role);

  return res.status(200).send({ message: 'user verified' });
}

const emailChange = async (req: Request, res: Response) => {
  const id = req.body.user.id;
  const { email } = req.body;
  const user = await userService.createTemporalEmail(id, email);
  console.log(user)

  return res.status(200).send({ message: 'Please verify your new email' });
}

const verifyNewEmail = async (req: Request, res: Response) => {
  const token = req.params.token
  const payload = await verifyToken(token, 'email');
  await userService.updateEmail(payload.id);

  return res.status(200).send({ message: 'email changed' });
}

export { getUser, verifyUser, emailChange, verifyNewEmail }