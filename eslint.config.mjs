import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import node from "eslint-plugin-n";
import security from "eslint-plugin-security";
import jest from "eslint-plugin-jest";

export default {
  ignore: ["dist/"],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: ["./tsconfig.json"], // Use an array
      tsconfigRootDir: import.meta.dirname, // Ensure correctpath resolution
    },
  },

  plugins: {
    "@typescript-eslint": tseslint,
    prettier,
    import: importPlugin,
    security,
    node,
    jest,
  },

  rules: {
    // ✅ General Best Practices
    "no-console": "warn",
    "no-unused-vars": "off", // Prevents conflict with TypeScript
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-shadow": "error",
    "consistent-return": "error",
    "prefer-const": "warn",

    // ✅ TypeScript Rules
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",

    // ✅ Import Rules
    "import/no-extraneous-dependencies": "error",
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { order: "asc", caseInsensitive: true },
      },
    ],

    // ✅ Node.js Best Practices
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-missing-import": "off",

    // ✅ Security Best Practices
    "security/detect-object-injection": "warn",

    // ✅ Jest Testing Rules
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",

    // ✅ Prettier for Formatting
    "prettier/prettier": ["error", { singleQuote: true, semi: true, trailingComma: "all" }],
  },
};
