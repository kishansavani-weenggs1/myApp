import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.js";
import {
  uploadMainImage,
  uploadMainVideo,
  uploadOtherImages,
} from "../controllers/fileUpload.js";
import {
  multipleImageUpload,
  singleImageUpload,
  singleVideoUpload,
} from "../middlewares/fileUpload.js";
import { validatePostExists } from "../middlewares/validatePostExists.js";
import { validate } from "../middlewares/validateZod.js";
import { uploadFileSchema } from "../config/schema/fileUploads.js";

const router = Router();

router.use(authenticateJwt);

router.post(
  "/main-image/:postId",
  validate(uploadFileSchema),
  validatePostExists,
  singleImageUpload,
  uploadMainImage
);
router.post(
  "/other-images/:postId",
  validate(uploadFileSchema),
  validatePostExists,
  multipleImageUpload,
  uploadMainVideo
);
router.post(
  "/video/:postId",
  validate(uploadFileSchema),
  validatePostExists,
  singleVideoUpload,
  uploadOtherImages
);

export default router;
