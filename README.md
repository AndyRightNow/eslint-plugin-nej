# eslint-plugin-nej

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







