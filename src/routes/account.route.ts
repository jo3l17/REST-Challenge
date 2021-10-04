import { Router } from "express";
import { verify } from "../controllers/account.controller";

const accountRouter: Router = Router();

accountRouter.patch('/:token/verify', verify)

export { accountRouter };