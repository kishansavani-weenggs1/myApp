import { Response, NextFunction, Request } from "express";
import { HTTP_STATUS } from "../config/constants.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.error(err); // log error

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || "Something went wrong",
  });

  next();
};
