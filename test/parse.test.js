const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const { mockGoogle } = require("../fixtures/mock");
const translate = require("../src/index");

// Canned response bodies, so each parsing branch is hit deterministically. The
// input text is irrelevant; only the reply matters.
function respondingWith(body) {
    return mockGoogle({ body: JSON.stringify(body) });
}

describe("response parsing (mocked dispatcher)", () => {
    test("joins the text, reads the detected language, and exposes raw on request", async (t) => {
        const body = [
            [
                [ "Hello ", "x", null, null, 0 ],
                [ "world", "y", null, null, 0 ],
                [ null, "z" ]
            ],
            null,
            "en",
            null, null, null, null, null,
            [ [ "en" ], null, [ 1 ], [ "en" ] ]
        ];
        const first = respondingWith(body);
        const second = respondingWith(body);
        t.after(async () => { await first.close(); await second.close(); });

        const result = await translate("whatever", { dispatcher: first });
        assert.equal(result.text, "Hello world");
        assert.equal(result.from.language.iso, "en");
        assert.equal(result.from.language.didYouMean, false);
        assert.equal(result.from.text.value, "");
        assert.equal(result.raw, "");

        const withRaw = await translate("whatever", { raw: true, dispatcher: second });
        assert.deepEqual(withRaw.raw, body);
    });

    test("flags didYouMean when the detected language disagrees with the echo", async (t) => {
        const agent = respondingWith([
            [ [ "Hello", "Hola", null, null, 0 ] ],
            null,
            "en",
            null, null, null, null, null,
            [ [ "es" ], null, [ 1 ], [ "es" ] ]
        ]);
        t.after(() => agent.close());

        const result = await translate("whatever", { dispatcher: agent });
        assert.equal(result.from.language.didYouMean, true);
        assert.equal(result.from.language.iso, "es");
    });

    test("unwraps a source-text correction and flags it", async (t) => {
        const agent = respondingWith([
            [ [ "Hello", "Helo", null, null, 0 ] ],
            null,
            "en",
            null, null, null, null,
            [ "<b><i>Hello</i></b> world", null, null, null, null, true ],
            [ [ "en" ], null, [ 1 ], [ "en" ] ]
        ]);
        t.after(() => agent.close());

        const result = await translate("whatever", { dispatcher: agent });
        assert.equal(result.from.text.value, "[Hello] world");
        assert.equal(result.from.text.autoCorrected, true);
    });
});
