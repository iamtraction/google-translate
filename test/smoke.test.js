const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const translate = require("../src/index");

describe("live smoke (real endpoint, shape only)", () => {
    // Hits the real endpoint. Asserts shape, not content -- whether a translation
    // is correct is Google's job, not this library's.
    test("a real response parses into our result shape", { timeout: 15000 }, async () => {
        const result = await translate("hello");

        assert.equal(typeof result.text, "string");
        assert.ok(result.text.length > 0);
        assert.equal(typeof result.from.language.iso, "string");
        assert.ok(result.from.language.iso.length > 0);
        assert.equal(typeof result.from.language.didYouMean, "boolean");
        assert.equal(typeof result.from.text.value, "string");
        assert.equal(typeof result.from.text.autoCorrected, "boolean");
        assert.equal(typeof result.from.text.didYouMean, "boolean");
    });
});
