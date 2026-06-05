import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".astro/**", "assets/**", ".superpowers/**", "config/**"],
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      sourceType: "module",
    },
    rules: {},
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {},
  },
];
