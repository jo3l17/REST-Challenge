import express from "express";
import { json, urlencoded } from "body-parser";
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost'

app.use(morgan('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
  console.log(`App running at http://${HOST}:${PORT}`);
})
