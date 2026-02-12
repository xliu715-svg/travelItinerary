import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["eslint.config.mts", "dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.{ts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // No Implicit Any
      "@typescript-eslint/no-explicit-any": "error",

      // Consistent Arrow Functions
      "prefer-arrow-callback": "error",
      "func-style": ["error", "expression"],

      // No Unused Variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Strict Equality
      eqeqeq: ["error", "always"],

      // Async/Await Consistency
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "require-await": "error",

      // Naming Conventions
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
  ...tseslint.configs.recommendedTypeChecked,
]);
