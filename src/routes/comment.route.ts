import { Router } from "express";
import { createComment, deleteComment, getAllComments, getActionOfComment, giveActionToComment, updateComment } from "../controllers/comment.controller";

const commentRouter: Router = Router({mergeParams: true});
const commentAccountRouter: Router = Router({mergeParams: true});
const commentPostRouter: Router = Router({mergeParams: true});

commentRouter
  .get("/:commentId/:action", getActionOfComment)
  .patch("/:commentId/:action", giveActionToComment)
  

commentAccountRouter
  .get("/", getAllComments)

commentPostRouter
  .post("/", createComment)
  .patch("/:commentId", updateComment)
  .patch("/:commentId/:action", giveActionToComment)
  .delete("/:commenttId", deleteComment)

export { commentRouter, commentAccountRouter, commentPostRouter };