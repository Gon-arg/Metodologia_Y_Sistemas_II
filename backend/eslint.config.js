const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: [
            "node_modules/**",
            "coverage/**"
        ]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_"
                }
            ]
        }
    }
];