const querystring = require("querystring");
const { request } = require("undici");

const languages = require("./languages");

/**
 * @function translate
 * @param {String} text The text to be translated.
 * @param {Object} options The options object for the translator.
 * @returns {Object} The result containing the translation.
 */
async function translate(text, options) {
    if (typeof options !== "object") options = {};
    text = String(text);

    // Check if a lanugage is in supported; if not, throw an error object.
    let error;
    [ options.from, options.to ].forEach((lang) => {
        if (lang && !languages.isSupported(lang)) {
            error = new Error(`The language '${lang}' is not supported.`);
            error.name = "UnsupportedLanguageError";
            error.code = 400;
        }
    });
    if (error) throw error;

    // If options object doesn't have a "from" language, set it to "auto".
    if (!options.from) options.from = "auto";
    // If options object doesn't have a "to" language, set it to "en".
    if (!options.to) options.to = "en";
    // If options object has a "raw" property evaluating to true, set it to true.
    options.raw = Boolean(options.raw);

    // Get ISO 639-1 codes for the languages.
    options.from = languages.getISOCode(options.from);
    options.to = languages.getISOCode(options.to);

    // URL & query string required by Google Translate.
    let baseUrl = "https://translate.google.com/translate_a/single";
    let data = {
        client: "gtx",
        sl: options.from,
        tl: options.to,
        hl: options.to,
        dt: [ "at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t" ],
        ie: "UTF-8",
        oe: "UTF-8",
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text,
    };

    // Append query string to the request URL.
    let url = `${baseUrl}?${querystring.stringify(data)}`;

    let requestOptions;
    // If request URL is greater than 2048 characters, use POST method.
    if (url.length > 2048) {
        delete data.q;
        requestOptions = [
            `${baseUrl}?${querystring.stringify(data)}`,
            {
                method: "POST",
                body: new URLSearchParams({ q: text }).toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }
        ];
    }
    else {
        requestOptions = [ url ];
    }

    // Request translation from Google Translate.
    let response = await request(...requestOptions);

    // Error responses are HTML, not JSON.
    if (response.statusCode !== 200) {
        await response.body.dump();

        let responseError = new Error(`Google Translate responded with the status code ${response.statusCode}.`);
        responseError.name = "TranslateResponseError";
        responseError.code = response.statusCode;
        throw responseError;
    }

    let body;
    try {
        body = await response.body.json();
    }
    catch (cause) {
        let parseError = new Error("Google Translate returned a malformed response.", { cause });
        parseError.name = "TranslateResponseError";
        parseError.code = 502;
        throw parseError;
    }

    let result = {
        text: "",
        from: {
            language: {
                didYouMean: false,
                iso: ""
            },
            text: {
                autoCorrected: false,
                value: "",
                didYouMean: false
            }
        },
        raw: ""
    };

    // If user requested a raw output, add the raw response to the result
    if (options.raw) {
        result.raw = body;
    }

    // Parse body and add it to the result object.
    body[0].forEach((obj) => {
        if (obj[0]) {
            result.text += obj[0];
        }
    });

    if (body[2] === body[8][0][0]) {
        result.from.language.iso = body[2];
    }
    else {
        result.from.language.didYouMean = true;
        result.from.language.iso = body[8][0][0];
    }

    if (body[7] && body[7][0]) {
        let str = body[7][0];

        str = str.replace(/<b><i>/g, "[");
        str = str.replace(/<\/i><\/b>/g, "]");

        result.from.text.value = str;

        if (body[7][5] === true) {
            result.from.text.autoCorrected = true;
        }
        else {
            result.from.text.didYouMean = true;
        }
    }

    return result;
}

module.exports = translate;
module.exports.languages = languages;
