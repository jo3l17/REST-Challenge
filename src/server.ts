import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import { PrismaClient } from '.prisma/client';
import createHttpError from 'http-errors';
import { router } from './router';

export const prisma = new PrismaClient({
  rejectOnNotFound: (error) => new createHttpError.NotFound(error.message),
});

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(morgan('dev'));
app.use(urlencoded({ extended: false }));
app.use(json());

app.use('/api/v1', router(app))

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
  console.log(`App running at http://${HOST}${PORT ? `:${PORT}` : ''}`);
});
