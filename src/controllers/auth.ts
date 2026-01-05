import { NextFunction, Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from "../utils/common.js";
import { comparePassword } from "../utils/common.js";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt.js";
import { ENV } from "../config/env.js";
import { Constants, UserRole } from "../config/constants.js";
import { UserAttributes } from "../types/models.js";
import { HTTP_STATUS } from "../config/constants.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { insertUserSchema, updateUserSchema } from "../db/validate-schema.js";
import { and, eq, isNull } from "drizzle-orm";
import { changePasswordBody, LoginBody, SignUpBody } from "../types/zod.js";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginBody = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
    }

    const refreshToken = generateRefreshToken(user);

    const updateData = updateUserSchema.parse({
      refreshToken,
      tokenVersion: user?.tokenVersion ? ++user.tokenVersion : 1,
      updatedId: Constants.SYSTEM.ID,
    });
    await db.update(users).set(updateData).where(eq(users.id, user.id));

    const accessToken = generateAccessToken(user);

    // Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(HTTP_STATUS.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password }: SignUpBody = req.body;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const insertData = insertUserSchema.parse({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await db.insert(users).values(insertData);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = req.cookies?.refreshToken;
    if (!token)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Refresh token missing" });

    const payload = jwt.verify(token, ENV.JWT.REFRESH_SECRET) as JwtPayload;

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, payload.id), isNull(users.deletedAt)))
      .limit(1);
    if (!user || user.refreshToken !== token) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid refresh token" });
    }

    const newRefreshToken = generateRefreshToken(user);

    const updateData = updateUserSchema.parse({
      refreshToken: newRefreshToken,
      tokenVersion: user?.tokenVersion ? ++user.tokenVersion : 1,
      updatedId: user.id,
    });
    await db.update(users).set(updateData).where(eq(users.id, user.id));

    const newAccessToken = generateAccessToken(user);

    // Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(HTTP_STATUS.OK).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as UserAttributes;
    if (user && user.id) {
      const [userInfo] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, user.id), isNull(users.deletedAt)))
        .limit(1);

      if (userInfo && userInfo.id) {
        const updateData = updateUserSchema.parse({
          refreshToken: null,
          tokenVersion: user?.tokenVersion ? ++user.tokenVersion : 1,
          updatedId: user.id,
        });
        await db.update(users).set(updateData).where(eq(users.id, userInfo.id));
      } else {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid request" });
      }
    } else {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid request" });
    }

    // remove cookie from client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword }: changePasswordBody = req.body;
    const user = req.user as UserAttributes;

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    const isValid = await comparePassword(oldPassword, user.password);

    if (!isValid) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
    }

    const refreshToken = generateRefreshToken(user);

    const hashedPassword = await hashPassword(newPassword);

    const updateData = updateUserSchema.parse({
      password: hashedPassword,
      refreshToken,
      tokenVersion: user?.tokenVersion ? ++user.tokenVersion : 1,
      updatedId: user.id,
    });
    await db.update(users).set(updateData).where(eq(users.id, user.id));

    const accessToken = generateAccessToken(user);

    // Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ accessToken, message: "Password Changed Successfully" });
  } catch (error) {
    next(error);
  }
};
