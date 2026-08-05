const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const { MockAgent, setGlobalDispatcher, getGlobalDispatcher } = require("undici");

const { mockGoogle } = require("../fixtures/mock");
const translate = require("../src/index");

// A well-formed reply, so translate() gets far enough to send its request.
const OK = JSON.stringify([
    [ [ "x", "y", null, null, 0 ] ],
    null,
    "en",
    null, null, null, null, null,
    [ [ "en" ], null, [ 1 ], [ "en" ] ]
]);

function query(path) {
    return new URLSearchParams(path.split("?")[1]);
}

describe("request building (mocked dispatcher)", () => {
    test("builds the query from the options, resolving names and repeating dt", async (t) => {
        const defaults = {};
        const explicit = {};
        const a = mockGoogle({ body: OK, capture: defaults });
        const b = mockGoogle({ body: OK, capture: explicit });
        t.after(async () => { await a.close(); await b.close(); });

        await translate("Hola", { dispatcher: a });
        const dq = query(defaults.path);
        assert.equal(dq.get("sl"), "auto");
        assert.equal(dq.get("tl"), "en");
        assert.equal(dq.get("q"), "Hola");
        // dt is repeated, not comma-joined (URLSearchParams would join an array).
        assert.ok(dq.getAll("dt").length > 1, "dt must repeat once per value");
        assert.ok(!defaults.path.includes("%2C"), "dt must not be comma-joined");

        await translate("Hola", { from: "French", to: "Spanish", dispatcher: b });
        const eq = query(explicit.path);
        assert.equal(eq.get("sl"), "fr");
        assert.equal(eq.get("tl"), "es");
    });

    test("moves the text to the request body when the URL would be too long", async (t) => {
        const captured = {};
        const agent = mockGoogle({ body: OK, capture: captured });
        t.after(() => agent.close());

        const text = "The quick brown fox jumps over the lazy dog. ".repeat(50);
        assert.ok(text.length > 2048, "the fixture is too short to trip the POST branch");

        await translate(text, { dispatcher: agent });

        // Past 2048 characters q moves from the URL into the body.
        assert.equal(query(captured.path).get("q"), null);
        assert.ok(captured.path.length <= 2048, "the URL should no longer be oversized");
        assert.equal(new URLSearchParams(captured.body).get("q"), text);
    });

    test("tolerates a missing or non-object options argument", async (t) => {
        // null is typeof "object", so it needs its own guard or options.from
        // throws. No dispatcher is passed, so a global mock stands in.
        const previous = getGlobalDispatcher();
        const agent = new MockAgent();
        agent.disableNetConnect();
        agent.get("https://translate.google.com")
            .intercept({ path: () => true, method: () => true })
            .reply(200, OK, { headers: { "content-type": "application/json" } })
            .times(2);
        setGlobalDispatcher(agent);
        t.after(async () => {
            setGlobalDispatcher(previous);
            await agent.close();
        });

        assert.equal(typeof (await translate("hi")).text, "string");
        assert.equal(typeof (await translate("hi", null)).text, "string");
    });
});
