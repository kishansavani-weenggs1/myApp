import fs from "fs";
import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { Constants } from "../config/constants.js";
import slugifyPkg from "slugify";

const slugify = slugifyPkg.default;

const uploadDir = path.resolve("src/uploads/posts");
// Create directory if it not exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${slugify(path.basename(file.originalname, path.extname(file.originalname)), { lower: true, strict: true })}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

const videoFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("video/")) {
    cb(new Error("Only video files are allowed"));
    return;
  }
  cb(null, true);
};

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: Constants.MAX_IMAGE_SIZE },
});

const videoUpload = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: Constants.MAX_VIDEO_SIZE },
});

export const singleImageUpload: RequestHandler = imageUpload.single("main_image");
export const multipleImageUpload: RequestHandler = imageUpload.array("other_images", Constants.MAX_ALLOWED_IMAGES);
export const singleVideoUpload: RequestHandler = videoUpload.single("video");
