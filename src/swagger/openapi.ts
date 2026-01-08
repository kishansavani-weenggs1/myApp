import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.js";

import "./responses.js";
import "./schema.js";

import "./security.js";

import "./routes/auth.js";
import "./routes/posts.js";
import "./routes/comments.js";
import "./routes/chat.js";

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions
).generateDocument({
  openapi: "3.0.3",
  info: {
    title: "MyApp",
    version: "1.0.0",
    description: "Api docs",
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
});
