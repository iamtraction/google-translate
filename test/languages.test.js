const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const languages = require("../src/languages");

describe("languages", () => {
    test("getCode resolves codes and names and reports the unknown", () => {
        assert.equal(languages.getCode("en"), "en");
        assert.equal(languages.getCode("EN"), "en");
        assert.equal(languages.getCode("Spanish"), "es");
        // The code keeps the table's casing; Google treats the script subtag as significant.
        assert.equal(languages.getCode("crh-latn"), "crh-Latn");
        assert.equal(languages.getCode("xx"), null);
        assert.equal(languages.getCode(""), null);
    });
});
