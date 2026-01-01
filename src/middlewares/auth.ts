import { NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";
import { UserAttributes } from "../types/models/users.js";
import { HTTP_STATUS } from "../config/constants.js";

export const authenticateJwt: RequestHandler = passport.authenticate("jwt", {
  session: false,
});

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserAttributes;

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user?.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Forbidden: You do not have access",
      });
    }

    next();
  };
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: UserAttributes) => {
      if (err) return next(err);

      if (user) {
        req.user = user; // attach user if logged in
      }

      next();
    },
  )(req, res, next);
};
