import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { JwtPayload } from "../types/jwt.js";

export function verifyWsToken(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT.ACCESS_SECRET) as JwtPayload;
}
