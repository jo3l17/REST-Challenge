import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.status ?? 500).send(err);
}