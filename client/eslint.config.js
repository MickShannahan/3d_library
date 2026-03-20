import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginTs from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,tsx,vue}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: pluginTs.parser,
        sourceType: "module"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn",
      "vue/html-self-closing": 0,
      "vue/multi-word-component-names": "off",
      "vue/no-undef-properties": "error",
      "vue/require-v-for-key": "warn",
      "vue/block-order": ["warn", {
        "order": [["script", "template"], "style"]
      }],
      "vue/component-api-style": ["warn",
        ["script-setup", "composition"]
      ]
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        parser: pluginTs.parser
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn"
    }
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn"
    }
  }
];
