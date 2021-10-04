import { Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verifyToken } from "../services/auth.service";

const verify = async (req: Request, res: Response) => {
  const token = req.params.token
  try {
    const payload = await verifyToken(token, req, res);
    return res.status(400).send(payload);
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(500).send({ message: 'token expired' })
    }
    return res.status(500).send({ message: 'token error' })
  }
}

export { verify }
