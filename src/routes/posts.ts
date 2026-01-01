import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.js";
import {
  createPost,
  deletePost,
  editPost,
  getPosts,
} from "../controllers/posts.js";
import { validate } from "../middlewares/validateZod.js";
import {
  createPostSchema,
  editPostSchema,
  getPostsSchema,
} from "../config/schema/posts.js";
import { commonDeleteSchema } from "../config/schema/common.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", validate(getPostsSchema), getPosts);
router.post("/create", validate(createPostSchema), createPost);
router.put("/edit/:id", validate(editPostSchema), editPost);
router.delete("/delete/:id", validate(commonDeleteSchema), deletePost);

export default router;
