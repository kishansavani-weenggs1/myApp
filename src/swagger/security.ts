import { registry } from "./registry.js";

export const JWT_SECURITY_SCHEME = "bearerAuth";

registry.registerComponent("securitySchemes", JWT_SECURITY_SCHEME, {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter JWT token",
});
