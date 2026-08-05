const { MockAgent } = require("undici");

const JSON_HEADERS = { "content-type": "application/json" };

/**
 * A MockAgent that answers the Google Translate endpoint once. Pass `capture`
 * to record the request path and body the library sent.
 * @param {Object} options Reply status/body/headers and an optional capture.
 * @returns {MockAgent} A dispatcher to pass as options.dispatcher.
 */
function mockGoogle({ status = 200, body = "", jsonHeaders = true, capture } = {}) {
    const agent = new MockAgent();
    agent.disableNetConnect();
    agent.get("https://translate.google.com")
        .intercept({
            path: (path) => {
                if (capture) capture.path = path;
                return path.startsWith("/translate_a/single");
            },
            method: () => true,
            body: (requestBody) => {
                if (capture) capture.body = requestBody;
                return true;
            }
        })
        .reply(status, body, jsonHeaders ? { headers: JSON_HEADERS } : undefined)
        .times(1);
    return agent;
}

module.exports = { mockGoogle };
