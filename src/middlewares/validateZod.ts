import { z } from "../swagger/zod.js";
import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../config/constants.js";

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors: z.treeifyError(result.error),
      });
    }

    if (result.data.body) req.body = result.data.body;
    else if (result.data.query) Object.assign(req.query, result.data.query);
    else if (result.data.params) Object.assign(req.params, result.data.params);

    next();
  };
