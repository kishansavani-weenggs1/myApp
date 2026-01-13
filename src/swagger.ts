import swaggerJSDoc from "swagger-jsdoc";
import { OpenAPIV3 } from "openapi-types";
import { ENV } from "./config/env.js";

export const swaggerSpec: OpenAPIV3.Document = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyApp",
      version: "1.0.0",
      description:
        "Demo application to learn different functionalities with node.js",
    },
    servers: [{ url: `http://localhost:${ENV.APP_PORT}` }],
  },
  apis: ["./src/routes/*.ts"],
}) as OpenAPIV3.Document;
