const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: globals.node
        },
        rules: {
            indent: [ "error", 4 ],
            "linebreak-style": [ "error", "unix" ],
            quotes: [ "error", "double" ],
            semi: [ "error", "always" ]
        }
    }
]);
