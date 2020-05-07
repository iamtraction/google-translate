/**
 * Last update: 2/11/2018
 * https://translate.google.com/translate/releases/twsfe_w_20160620_RC00/r/js/desktop_module_main.js
 *
 * Everything between 'BEGIN' and 'END' was copied from the script above.
 */

const got = require("got");

/* eslint-disable */
// BEGIN
function zr(a) {
    let b;
    if (null !== yr) b = yr;
    else {
        b = wr(String.fromCharCode(84));
        let c = wr(String.fromCharCode(75));
        b = [ b(), b() ];
        b[1] = c();
        b = (yr = window[b.join(c())] || "") || "";
    }
    let d = wr(String.fromCharCode(116));
    let c = wr(String.fromCharCode(107));
    d = [ d(), d() ];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    // eslint-disable-next-line no-var
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        let l = a.charCodeAt(g);
        128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : ((l & 64512) == 55296 && g + 1 < a.length && (a.charCodeAt(g + 1) & 64512) == 56320 ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = l >> 18 | 240, e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224, e[f++] = l >> 6 & 63 | 128), e[f++] = l & 63 | 128);
    }
    a = b;
    for (let f = 0; f < e.length; f++) a += e[f], a = xr(a, "+-a^+6");
    a = xr(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b));
}

let yr = null;
let wr = function(a) {
    return function() {
        return a;
    };
};
let xr = function(a, b) {
    for (let c = 0; c < b.length - 2; c += 3) {
        let d = b.charAt(c + 2);
        d = d >= "a" ? d.charCodeAt(0) - 87 : Number(d);
        d = b.charAt(c + 1) == "+" ? a >>> d : a << d;
        a = b.charAt(c) == "+" ? a + d & 4294967295 : a ^ d;
    }
    return a;
};
// END
/* eslint-enable */

const config = new Map();

const window = {
    TKK: config.get("TKK") || "0"
};

// eslint-disable-next-line require-jsdoc
async function updateTKK() {
    try {
        let now = Math.floor(Date.now() / 3600000);

        if (Number(window.TKK.split(".")[0]) !== now) {
            let res = await got("https://translate.google.com");

            // code will extract something like tkk:'1232135.131231321312', we need only value
            const code = res.body.match(/tkk:'\d+.\d+'/g);

            if (code.length > 0) {
                // extracting value tkk:'1232135.131231321312', this will extract only token: 1232135.131231321312
                const xt = code[0].split(":")[1].replace(/'/g, "");

                window.TKK = xt;
                config.set("TKK", xt);
            }
        }
    }
    catch (e) {
        if (e.name === "HTTPError") {
            let error = new Error();
            error.name = e.name;
            error.statusCode = e.statusCode;
            error.statusMessage = e.statusMessage;
            throw error;
        }
        throw e;
    }
}

// eslint-disable-next-line require-jsdoc
async function generate(text) {
    try {
        await updateTKK();

        let tk = zr(text);
        tk = tk.replace("&tk=", "");
        return { name: "tk", value: tk };
    }
    catch (error) {
        return error;
    }
}

module.exports.generate = generate;
