const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const { mockGoogle } = require("../fixtures/mock");
const translate = require("../src/index");

describe("translate rejections", () => {
    test("rejects an unsupported language before any request", async () => {
        // Validated before the network, so no dispatcher is needed.
        await assert.rejects(translate("Hi", { to: "xx" }), (error) => {
            assert.equal(error.name, "UnsupportedLanguageError");
            assert.equal(error.code, 400);
            return true;
        });
        await assert.rejects(translate("Hi", { from: "zz" }), (error) => {
            assert.equal(error.name, "UnsupportedLanguageError");
            return true;
        });
    });

    test("maps a non-200 response to a TranslateResponseError", async (t) => {
        const agent = mockGoogle({ status: 429, body: "<html>rate limited</html>", jsonHeaders: false });
        t.after(() => agent.close());

        await assert.rejects(translate("Hello", { dispatcher: agent }), (error) => {
            assert.equal(error.name, "TranslateResponseError");
            assert.equal(error.code, 429);
            return true;
        });
    });

    test("maps a malformed body to a 502 and keeps the parse failure as the cause", async (t) => {
        const agent = mockGoogle({ status: 200, body: "this is not json", jsonHeaders: false });
        t.after(() => agent.close());

        await assert.rejects(translate("Hello", { dispatcher: agent }), (error) => {
            assert.equal(error.name, "TranslateResponseError");
            assert.equal(error.code, 502);
            assert.ok(error.cause, "the parse failure should be kept as the cause");
            return true;
        });
    });
});
