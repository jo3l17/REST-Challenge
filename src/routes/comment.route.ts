import { Router } from "express";
import { createComment, deleteComment, getDislikesOfComment, getLikesOfComment, giveDislikeToComment, giveLikeToComment, updateComment } from "../controllers/comment.controller";

const commentRouter: Router = Router();
commentRouter
  .get("/commentId/likes",getLikesOfComment)
  .get("/commentId/dislikes", getDislikesOfComment)
  .post("/", createComment)
  .patch("/commentId", updateComment)
  .patch("/commentId/like", giveLikeToComment)
  .patch("/commentId/dislike", giveDislikeToComment)
  .delete("/commenttId", deleteComment)

export { commentRouter };