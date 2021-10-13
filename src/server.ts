import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import { PrismaClient } from '.prisma/client';
import { authRouter } from './routes/auth.route';
import { postRouter } from './routes/post.route';
import { accountRouter } from './routes/account.route';
import { userRoute } from './routes/user.route';
import asyncHandler from 'express-async-handler';
import { errorHandler } from './utils/error.util';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(morgan('dev'));
app.use(urlencoded({ extended: false }));
app.use(json());

app
  .use(asyncHandler(authRouter))
  .use('/accounts', asyncHandler(accountRouter))
  .use('/users', asyncHandler(userRoute))
  .use('/posts', postRouter)
  .use(errorHandler);

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
  console.log(`App running at http://${HOST}:${PORT}`);
});
