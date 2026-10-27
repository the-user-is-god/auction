import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    // Ignore compiled folders and third-party modules
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-console": "warn", // Warns you if you leave console.logs behind
      "@typescript-eslint/no-explicit-any": "off", // Allows 'any' since you use it for rapid casting sometimes
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // Errors on unused variables unless prefixed with _
      semi: ["error", "always"],
    },
  },
];
