// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Express } from 'express'
import { UserMiddlewareDto } from '../../src/models/users/response/user-middleware.dto';

declare global {
  namespace Express {
    interface Request {
      user: UserMiddlewareDto
    }
  }
}