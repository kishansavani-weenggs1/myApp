import { registry } from "./registry.js";
import { loginSchema } from "../config/schema/auth.js";
import { ErrorSchema, ValidationErrorSchema } from "./errors.js";

registry.register("Error", ErrorSchema);
registry.register("ValidationError", ValidationErrorSchema);

registry.register("Login", loginSchema);
