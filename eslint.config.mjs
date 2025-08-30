import globals from "globals";
import {defineConfig} from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default defineConfig([
  {
    files: ["editor/**/*.js", "runtime/**/*.js", "test/**/*.js", "app/**/*.js", "app/**/*.jsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in modern React
      "react/prop-types": "off", // Not needed with TypeScript or modern React
      "spaced-comment": ["error", "always"],
    },
  },
  {
    ignores: ["**/*.recho.js"],
  },
  eslintConfigPrettier,
]);
