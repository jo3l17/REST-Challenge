import { Router } from 'express';
import {
  passwordChange,
  passwordRecover,
} from '../controllers/auth.controller';
import {
  emailChange,
  getUser,
  verifyNewEmail,
  verifyUser,
} from '../controllers/user.controller';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.middleware';

const userRoute = Router();

userRoute
  .get('/me', protect, asyncHandler(getUser))
  .get('/:id', asyncHandler(getUser))
  .post('/passwords/recovery', asyncHandler(passwordRecover))
  .patch('/:token/verify', asyncHandler(verifyUser))
  .patch('/passwords/:token', asyncHandler(passwordChange))
  .patch('/email', protect, asyncHandler(emailChange))
  .patch('/email/:token', asyncHandler(verifyNewEmail));

export { userRoute };
