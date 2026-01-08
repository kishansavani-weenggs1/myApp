import * as bcrypt from "bcrypt";
import { Constants, HTTP_STATUS, RESPONSE } from "../config/constants.js";
import jwt from "jsonwebtoken";
import { UserAttributes } from "../types/models.js";
import { ENV } from "../config/env.js";
import { RawData } from "ws";
import path from "path";

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

export const rawDataToString = (data: RawData): string => {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  return Buffer.from(data).toString("utf8");
};

export const resolveUploadPath = (relativePath: string) => {
  return path.resolve("src/uploads", relativePath);
};

type ResponsesMap = {
  [key: string]: unknown;
};

export const withCommonResponses = (
  responses = {},
  excludeErrors: number[] = [],
  includeForbiddenError = false
) => {
  const commonResponses: ResponsesMap = {};
  if (!excludeErrors.includes(HTTP_STATUS.BAD_REQUEST))
    commonResponses[HTTP_STATUS.BAD_REQUEST] = {
      $ref: `#/components/responses/${RESPONSE.VALIDATION_ERROR}`,
    };

  if (!excludeErrors.includes(HTTP_STATUS.UNAUTHORIZED))
    commonResponses[HTTP_STATUS.UNAUTHORIZED] = {
      $ref: `#/components/responses/${RESPONSE.UNAUTHORIZED_ERROR}`,
    };

  if (includeForbiddenError)
    commonResponses[HTTP_STATUS.FORBIDDEN] = {
      $ref: `#/components/responses/${RESPONSE.CLIENT_ERROR}`,
    };

  if (!excludeErrors.includes(HTTP_STATUS.NOT_FOUND))
    commonResponses[HTTP_STATUS.NOT_FOUND] = {
      $ref: `#/components/responses/${RESPONSE.CLIENT_ERROR}`,
    };

  if (!excludeErrors.includes(HTTP_STATUS.INTERNAL_SERVER_ERROR))
    commonResponses[HTTP_STATUS.INTERNAL_SERVER_ERROR] = {
      $ref: `#/components/responses/${RESPONSE.SERVER_ERROR}`,
    };

  return {
    ...responses,
    ...commonResponses,
  };
};
