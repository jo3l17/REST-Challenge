import { Router } from "express";
import { appendFile } from "fs";
import { createPost, deletePost, getCommentsOfPost, getDislikesOfPost, getLikesOfPost, getPost, getPostList, giveDislikeToPost, giveLikeToPost, updatePost } from "../controllers/post.controller";

const postRouter: Router = Router();

postRouter
  .get("/", getPostList)
  .get("/postId", getPost)
  .get("/postId/comments", getCommentsOfPost)
  .get("/postId/likes", getLikesOfPost)
  .get("/postId/disklikes", getDislikesOfPost)
  .post("/", createPost)
  .patch("/postId", updatePost)
  .patch("/postId/like", giveLikeToPost)
  .patch("/postId/dislike", giveDislikeToPost)
  .delete("/postId", deletePost)

export { postRouter };