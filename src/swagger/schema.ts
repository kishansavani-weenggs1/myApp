import { registry } from "./registry.js";
import {
  ErrorSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema,
} from "./common-schema.js";

registry.register("Error", ErrorSchema);
registry.register("UnauthorizedError", UnauthorizedErrorSchema);
registry.register("ValidationError", ValidationErrorSchema);
