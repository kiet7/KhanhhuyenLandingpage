import { Router } from "express";
import { listPosts, getPostBySlug, createPost, updatePost, deletePost } from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listPosts);
router.get("/:slug", getPostBySlug);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
