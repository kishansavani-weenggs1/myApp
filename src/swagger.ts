import swaggerJSDoc from "swagger-jsdoc";
import { OpenAPIV3 } from "openapi-types";

export const swaggerSpec: OpenAPIV3.Document = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description:
        "Demo application to learn different functionalities with node.js",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.ts"],
}) as OpenAPIV3.Document;
