import { Response, NextFunction, Request } from "express";
import { HTTP_STATUS, MESSAGE } from "../config/constants.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.error(err); // log error

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || MESSAGE.INTERNAL_SERVER_ERROR,
  });

  next();
};
