# Forbids hard-coded protocols. (no-hard-coded-protocols)

For websites using HTTPS or HTTP-HTTPS compatible settings, hard-coded protocols should be avoided.

This rule has an autofixer. However, it fixes "http://" or "https://" instead of "http" or "https" in order to exclude some usage as words in text.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js

var url1 = 'https://www.example.com';
var url2 = 'http://www.example.com';
var url3 = `http://www.example.com`;
var protocol = 'http';

```

Examples of **correct** code for this rule:

```js

var url1 = window.location.protocol + '//www.example.com';

```

### Options

```js
  "rules": {
    "nej/no-hard-coded-protocols": ["error", {
      /**
       * Check against "https:" or "http:" instead of "https" or "http"
       * 
       * Defatul to false
       */
      "colon": false
    }]
  }
```
