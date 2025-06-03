/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // Plugin: @ianvs/prettier-plugin-sort-imports
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "^react($|[:/])",
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
  importOrderTypeScriptVersion: "5.0.0",

  // Plugin: prettier-plugin-tailwindcss
  tailwindFunctions: ["clsx", "cn", "cva", "twJoin", "twMerge"],

  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss", // MUST come last
  ],
};

export default config;
