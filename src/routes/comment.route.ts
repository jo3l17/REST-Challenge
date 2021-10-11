import { Router } from "express";
import { createComment, deleteComment, getAllComments, getActionOfComment, giveActionToComment, updateComment, getComment } from "../controllers/comment.controller";
import { protect } from "../middleware/auth.middleware";

const commentRouter: Router = Router({mergeParams: true});
const commentAccountRouter: Router = Router({mergeParams: true});
const commentPostRouter: Router = Router({mergeParams: true});

commentRouter
  .get("/", getAllComments)

commentPostRouter
  .get("/:commentId/:action", getActionOfComment)
  .post("/", protect, createComment)
  .patch("/:commentId/:action", protect, giveActionToComment)
  .delete("/:commenttId", deleteComment)

commentAccountRouter
  .get("/{commentId}", getComment)
  .post("/", createComment)
  .patch("/:commentId", updateComment)
  .patch("/:commentId/:action", giveActionToComment)
  .delete("/:commenttId", deleteComment)

export { commentRouter, commentAccountRouter, commentPostRouter };