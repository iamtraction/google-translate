/**
 * @param {String} text The text you want to translate.
 * @param {String} text The options for translating.
 */
declare function translate(text: string, options?: translate.TranslateOption): Promise<translate.TranslateResponse>;

declare namespace translate {
    interface TranslateOption {
        /** The language name or code to translate from. If none is given, it will auto detect the source language. */
        from?: string;
        /** The language name or code to translate to. If none is given, it will translate to English. */
        to?: string;
        /** If `true`, it will return the raw output that was received from Google Translate. */
        raw?: boolean;
    }

    interface TranslateResponse {
        /** The translated text */
        text: string;
        from: {
            language: {
                /** Whether or not the API suggest a correction in the source language. */
                didYouMean: boolean;
                /** The code of the language that the API has recognized in the text. */
                iso: string;
            };
            text: {
                /** Whether or not the API has auto corrected the original text. */
                autoCorrected: boolean;
                /** The auto corrected text or the text with suggested corrections, or `""` unless `from.text.autoCorrected` or `from.text.didYouMean` is `true`. */
                value: string;
                /** Wherether or not the API has suggested corrections to the text. */
                didYouMean: boolean;
            };
        };
        /** The raw response from Google Translate servers, or `""` unless `options.raw` is `true` in the request options. */
        raw: unknown[] | "";
    }

    /** The languages Google Translate supports, keyed by code. */
    type LanguageTable = {
        readonly [code: string]: string;
    };

    /** The language table, with its non-enumerable lookup helpers attached. */
    type Languages = LanguageTable & {
        /** Returns the code for a language name or code, case insensitively, or null if unsupported. */
        getISOCode(language: string): string | null;
        /** Returns whether the given code or display name is supported. */
        isSupported(language: string): boolean;
    };

    /** The error thrown when `options.from` or `options.to` is not a language Google Translate supports. */
    interface UnsupportedLanguageError extends Error {
        name: "UnsupportedLanguageError";
        /** Always `400`. */
        code: number;
    }

    /**
     * The error thrown when the request reached Google Translate but the
     * response could not be used.
     */
    interface TranslateResponseError extends Error {
        name: "TranslateResponseError";
        /** The response status code, or `502` if a `200` response could not be parsed. */
        code: number;
    }

    /** Any error `translate` rejects with. Narrow it on `name`. */
    type TranslateError = UnsupportedLanguageError | TranslateResponseError;

    const languages: Languages;
}

export = translate;
