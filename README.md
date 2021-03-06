# eslint-plugin-nej

[![NPM version][npm-image]][npm-url]

Eslint plugin for NEJ module system.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-nej`:

```
$ npm install eslint-plugin-nej --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-nej` globally.

## Usage

Add `nej` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "nej"
    ]
}
```

**Required:** Add nej path alias settings

```json
{
    "settings": {
        "nejPathAliases": {
            "pro": "src/javascript/"
        }
    }
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "nej/rule-name": 2
    }
}
```

## Supported Rules

* [nej/no-circular-dependencies](/docs/rules/no-circular-dependencies.md): Forbids circular dependencies.
* [nej/no-hard-coded-protocols](/docs/rules/no-hard-coded-protocols.md): Forbids hard-coded protocols.

[npm-url]: https://npmjs.org/package/eslint-plugin-nej
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-nej.svg





