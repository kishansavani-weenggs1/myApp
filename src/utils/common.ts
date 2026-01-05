import * as bcrypt from "bcrypt";
import { Constants } from "../config/constants.js";
import jwt from "jsonwebtoken";
import { UserAttributes } from "../types/models.js";
import { ENV } from "../config/env.js";
import { RawData } from "ws";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, Constants.PASSWORD_SALT);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (user: UserAttributes) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    ENV.JWT.ACCESS_SECRET,
    { expiresIn: ENV.JWT.ACCESS_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user: UserAttributes) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    ENV.JWT.REFRESH_SECRET,
    { expiresIn: ENV.JWT.REFRESH_EXPIRES_IN }
  );
};

export function rawDataToString(data: RawData): string {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  return Buffer.from(data).toString("utf8");
}
