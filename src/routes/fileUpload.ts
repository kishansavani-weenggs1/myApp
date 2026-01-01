import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.js";
import { uploadFile } from "../controllers/fileUpload.js";
import {
  multipleImageUpload,
  singleImageUpload,
  singleVideoUpload,
} from "../middlewares/fileUpload.js";

const router = Router();

router.use(authenticateJwt);

router.post("/main-image", singleImageUpload, uploadFile);
router.post("/other-images", multipleImageUpload, uploadFile);
router.post("/video", singleVideoUpload, uploadFile);

export default router;
