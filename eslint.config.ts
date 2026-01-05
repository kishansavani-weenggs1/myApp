import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // TypeScript parser options
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disable overly strict unsafe rules (backend-friendly)
  {
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },

  // Node.js globals
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // Ignore folders
  {
    ignores: [
      "node_modules/**",
      "tsconfig.json",
      "drizzle/**",
      "drizzle.config.ts",
    ],
  },
];
