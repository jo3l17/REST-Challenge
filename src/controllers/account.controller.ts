import { Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verifyToken } from "../services/auth.service";
import { updateVerification } from "../services/user.service";

const verifyUser = async (req: Request, res: Response) => {
  const token = req.params.token
  try {
    const payload = await verifyToken(token);
    await updateVerification(payload.id);
    return res.status(400).send({ message: 'user verified' });
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(500).send({ message: 'token expired' })
    }
    return res.status(500).send({ message: 'token error' })
  }
}

export { verifyUser }
