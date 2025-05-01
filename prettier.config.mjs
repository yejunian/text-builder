/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],

  // @ianvs/prettier-plugin-sort-imports
  importOrder: [
    "<TYPES>^(node:)",
    "<TYPES>^next/",
    "<TYPES>",
    "<TYPES>^[./]",
    "",
    "<BUILTIN_MODULES>",
    "",
    "^next($|[:/])",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/layouts/(.*)$",
    "",
    "^@/(.*)$",
    "",
    "^[./]",
  ],
};

export default config;
