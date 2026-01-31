import js from "@eslint/js";
import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default [
    {
        ignores: [
            "node_modules/**",
            "storage/**",
            "public/dist/**",
            "**/*.min.js",
            "**/*.ejs",
        ],
    },

    js.configs.recommended,

    // Backend specific rules
    {
        files: ["*.js", "src/**/*.js", "config/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",

            "no-var": "warn",
            "prefer-const": "warn",
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "no-console": "off",

            semi: ["error", "always"],
            quotes: ["error", "double", { avoidEscape: true }],
        },
    },

    // Fontend specific rules
    {
        files: ["public/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-var": "warn",
            "prefer-const": "warn",
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "no-console": "warn",
            semi: ["error", "always"],
            quotes: ["error", "single", { avoidEscape: true }],
        },
    },

    prettierPlugin,
];
