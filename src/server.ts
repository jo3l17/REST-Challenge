import express from "express";
import { json, urlencoded } from "body-parser";
import morgan from 'morgan';
import { PrismaClient } from ".prisma/client";
import { authRouter } from "./routes/auth.route";
import { postRouter } from "./routes/post.route";
import { commentRouter } from "./routes/comment.route";
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

app.use(authRouter);
app.use(postRouter);
app.use(commentRouter);
app.use(authRouter)
  .use('/account', accountRouter);
