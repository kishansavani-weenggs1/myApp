import { registry } from "./registry.js";
import {
  ErrorSchema,
  ValidationErrorSchema,
} from "./common-schema.js";

registry.register("Error", ErrorSchema);
registry.register("ValidationError", ValidationErrorSchema);
