import { Router } from "express";
import { createPost, deletePost, getAllPosts, getCommentsOfPost, getDislikesOfPost, getLikesOfPost, getPost, getPostList, giveActionToPost, updatePost } from "../controllers/post.controller";
import { protect } from "../middleware/auth.middleware";
import { verifyOwner, verifyRole } from "../middleware/post.middleware";

const postRouter: Router = Router({mergeParams: true});
const postAccountRouter: Router = Router({mergeParams: true});


postRouter
  .get("/", getPostList)
  .get("/:postId", getPost)
  .get("/:postId/comments", getCommentsOfPost)
  .get("/:postId/likes", getLikesOfPost)
  .get("/:postId/disklikes", getDislikesOfPost)

postAccountRouter
  .get("/", getAllPosts)
  .get("/:postId", getPost)
  .get("/:postId/comments", getCommentsOfPost)
  .get("/:postId/likes", getLikesOfPost)
  .get("/:postId/disklikes", getDislikesOfPost)
  .post("/", createPost)
  .patch("/:postId", updatePost)
  .delete("/:postId", verifyRole, deletePost)
  .patch("/:postId/:action", giveActionToPost)

export { postRouter, postAccountRouter };

