# Google Translate API
A [Node.JS](https://nodejs.org) library to consume Google Translate for free.

[![GitHub release](https://img.shields.io/github/release/k3rn31p4nic/google-translate-api.svg?style=flat)](https://github.com/k3rn31p4nic/google-translate-api/releases)
[![Dependencies](https://david-dm.org/k3rn31p4nic/google-translate-api.svg)](https://david-dm.org/k3rn31p4nic/google-translate-api)
[![Known Vulnerabilities](https://snyk.io/test/github/k3rn31p4nic/google-translate-api/badge.svg?targetFile=package.json)](https://snyk.io/test/github/k3rn31p4nic/google-translate-api?targetFile=package.json)
[![license](https://img.shields.io/github/license/k3rn31p4nic/google-translate-api.svg)](LICENSE)
[![Say Thanks!](https://img.shields.io/badge/Say%20Thanks-!-1EAEDB.svg)](https://saythanks.io/to/k3rn31p4nic)

### Feature Highlights
* Automatically detect source language
* Automatic spelling corrections
* Automatic language correction
* Fast and reliable

## Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [Examples](#examples)
* [Credits, etc](#extras)

## Installation
```bash
# Stable version, from npm repository
npm install --save @k3rn31p4nic/google-translate-api

# Latest version, from GitHub repository
npm install --save k3rn31p4nic/google-translate-api
```

## Usage
```js
// If you've installed from npm, do:
const translate = require('@k3rn31p4nic/google-translate-api');

// If you've installed from GitHub, do:
const translate = require('google-translate-api');
```

#### Method: `translate(text, options)`
```js
translate(text, options).then(console.log).catch(console.error);
```
| Parameter | Type | Optional | Default | Description |
|-|-|-|-|-|
| `text` | `String` | No | - | The text you want to translate. |
| `options` | `Object` | - | - | The options for translating. |
| `options.from` | `String` | Yes | `'auto'` | The language name/ISO 639-1 code to translate from. If none is given, it will auto detect the source language. |
| `options.to` | `String` | Yes | `'en'` | The language name/ISO 639-1 code to translate to. If none is given, it will translate to English. |
| `options.raw` | `Boolean` | Yes | `false` | If `true`, it will return the raw output that was received from Google Translate. |

#### Returns: `Promise<Object>`
**Response Object:**

| Key | Type | Description |
|-|-|-|
| `text` | `String` | The translated text. |
| `from` | `Object` | - |
| `from.language` | `Object` | - |
| `from.language.didYouMean` | `Boolean` | Whether or not the API suggest a correction in the source language. |
| `from.language.iso` | `String` | The ISO 639-1 code of the language that the API has recognized in the text. |
| `from.text` | `Object` | - |
| `from.text.autoCorrected` | `Boolean` | Whether or not the API has auto corrected the original text. |
| `from.text.value` | `String` | The auto corrected text or the text with suggested corrections. Only returned if `from.text.autoCorrected` or `from.text.didYouMean` is `true`. |
| `from.text.didYouMean` | `Boolean` | Wherether or not the API has suggested corrections to the text |
| `raw` | `String` | The raw response from Google Translate servers. Only returned if `options.raw` is `true` in the request options. |


## Examples
#### From automatic language detection to English:
```js
translate('Tu es incroyable!', { to: 'en' }).then(res => {
  console.log(res.text); // OUTPUT: You are amazing!
}).catch(err => {
  console.error(err);
});
```

#### From English to French, with a typo:
```js
translate('Thank you', { from: 'en', to: 'fr' }).then(res => {
  console.log(res.text); // OUTPUT: Je vous remercie
  console.log(res.from.autoCorrected); // OUTPUT: true
  console.log(res.from.text.value); // OUTPUT: [Thank] you
  console.log(res.from.text.didYouMean); // OUTPUT: false
}).catch(err => {
  console.error(err);
});
```

#### Sometimes Google Translate won't auto correct:
```js
translate('Thank you', { from: 'en', to: 'fr' }).then(res => {
  console.log(res.text); // OUTPUT: ''
  console.log(res.from.autoCorrected); // OUTPUT: false
  console.log(res.from.text.value); // OUTPUT: [Thank] you
  console.log(res.from.text.didYouMean); // OUTPUT: true
}).catch(err => {
  console.error(err);
});
```

## Extras
If you liked this project, please give it a ⭐ in [**GitHub**](https://github.com/k3rn31p4nic/google-translate-api) and/or [send a thank you note](https://saythanks.io/to/k3rn31p4nic).

> Credits to [matheuss](https://github.com/matheuss) for writing the original version of this library. I rewrote this, with improvements and without using many external libraries, as his library was not actively developed and had vulnerabilities.
