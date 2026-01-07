import { Router } from "express";
import { authenticateJwt, optionalAuth } from "../middlewares/auth.js";
import {
  createComment,
  deleteComment,
  editComment,
  getComments,
} from "../controllers/comments.js";
import { validate } from "../middlewares/validateZod.js";
import {
  createCommentSchema,
  editCommentSchema,
  getCommentsSchema,
} from "../config/schema/comments.js";
import { commonDeleteSchema } from "../config/schema/common.js";

const router = Router();

router.get("/", validate(getCommentsSchema), getComments);
router.post(
  "/create",
  optionalAuth,
  validate(createCommentSchema),
  createComment
);

router.use(authenticateJwt);
router.put("/edit/:id", validate(editCommentSchema), editComment);
router.delete("/delete/:id", validate(commonDeleteSchema), deleteComment);

export default router;
