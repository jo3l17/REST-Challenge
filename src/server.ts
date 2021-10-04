import express from "express";
import { json, urlencoded } from "body-parser";
import morgan from 'morgan';
import { PrismaClient } from ".prisma/client";
import { authRouter } from "./routes/auth.route";
import { accountRouter } from "./routes/account.route";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost'

app.use(morgan('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await prisma.$disconnect()
  }
  console.log(`App running at http://${HOST}:${PORT}`);
})

app.use(authRouter)
  .use('/account', accountRouter);