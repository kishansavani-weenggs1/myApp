import { RequestHandler } from "express";
import passport from "passport";
import { UserAttributes } from "../types/models.js";
import { HTTP_STATUS, MESSAGE } from "../config/constants.js";

export const authenticateJwt: RequestHandler = passport.authenticate("jwt", {
  session: false,
});

export const authorizeRoles =
  (...allowedRoles: string[]): RequestHandler =>
  (req, res, next) => {
    const user = req.user as UserAttributes;

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });
    }

    if (!allowedRoles.includes(user?.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: MESSAGE.UNAUTHORIZED,
      });
    }

    next();
  };

export const optionalAuth: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: UserAttributes) => {
      if (err) return next(err);

      if (user) {
        req.user = user; // attach user if logged in
      }

      next();
    }
  )(req, res, next);
};
