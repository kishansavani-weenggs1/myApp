import { RequestHandler } from "express";
import {
  FileTypesForPosts,
  HTTP_STATUS,
  MESSAGE,
} from "../config/constants.js";
import {
  UserAttributes,
  FileUploadCreationAttributes,
} from "../types/models.js";
import { insertFileUploadsSchema } from "../db/validate-schema.js";
import { db } from "../db/index.js";
import { fileUploads } from "../db/schema.js";
import path from "path";
import fs from "fs/promises";

const uploadFile =
  (fileType: FileTypesForPosts): RequestHandler =>
  async (req, res, next) => {
    const postId = Number(req.params.postId);
    const { id: userId } = req.user as UserAttributes;

    const files: Express.Multer.File[] = req.file
      ? [req.file]
      : Array.isArray(req.files)
        ? req.files
        : [];

    if (!files.length) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGE.REQUIRED("File") });
    }

    try {
      const insertData: FileUploadCreationAttributes[] = files.map((file) =>
        insertFileUploadsSchema.parse({
          postId: postId,
          type: fileType,
          name: path.basename(
            file.originalname,
            path.extname(file.originalname)
          ),
          url: file.path.replace(/^.*?uploads[\\/]/, ""),
          mimeType: file.mimetype,
          size: file.size,
          createdId: userId,
        })
      );

      const inserted = await db
        .insert(fileUploads)
        .values(insertData)
        .$returningId();

      res.status(HTTP_STATUS.CREATED).json({
        count: inserted.length,
        files: inserted.map((row, index) => ({
          id: row.id,
          url: insertData[index].url,
        })),
        message: MESSAGE.UPLOADED("File(s)"),
      });
    } catch (error) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => null))
      );
      next(error);
    }
  };

export const uploadMainImage = uploadFile(FileTypesForPosts.MAIN_IMAGE);
export const uploadMainVideo = uploadFile(FileTypesForPosts.MAIN_VIDEO);
export const uploadOtherImages = uploadFile(FileTypesForPosts.OTHER_IMAGES);
