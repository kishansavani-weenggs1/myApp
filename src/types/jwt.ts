import { UserRole } from "../config/constants.js";

export interface JwtPayload {
  id: number;
  role: UserRole;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
