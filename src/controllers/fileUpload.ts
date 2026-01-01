import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../config/constants.js";
import { UserAttributes } from "../types/models/users.js";
import { FileUploadCreationAttributes } from "../types/models/fileUploads.js";
import { insertFileUploadsSchema } from "../db/validate-schema.js";
import { db } from "../db/index.js";
import { fileUploads } from "../db/schema.js";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.user as UserAttributes;

    const files: Express.Multer.File[] = req.file
      ? [req.file]
      : Array.isArray(req.files)
        ? req.files
        : [];

    if (!files.length) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "File is required" });
    }

    const insertData: FileUploadCreationAttributes[] = files.map((file) =>
      insertFileUploadsSchema.parse({
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
      message: "Files uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};
