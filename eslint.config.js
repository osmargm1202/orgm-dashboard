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
];
