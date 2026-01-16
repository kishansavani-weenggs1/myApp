import { RESPONSE } from "../config/constants.js";
import { registry } from "./registry.js";

registry.registerComponent("responses", RESPONSE.CLIENT_ERROR, {
  description: "Client Error",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
});

registry.registerComponent("responses", RESPONSE.SERVER_ERROR, {
  description: "Internal Server Error",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
});

registry.registerComponent("responses", RESPONSE.VALIDATION_ERROR, {
  description: "Validation error",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ValidationError",
      },
    },
  },
});
