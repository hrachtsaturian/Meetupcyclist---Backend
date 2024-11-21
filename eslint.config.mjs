import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Use globals from the browser environment
        ...globals.jest,
        fail: "readonly",
        process: "readonly"
      },
    },
  },
];
