import { Router } from "express";
import { verifyUser } from "../controllers/account.controller";

const accountRouter: Router = Router();

accountRouter.patch('/:token/verify', verifyUser)

export { accountRouter };