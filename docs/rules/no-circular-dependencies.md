# Forbids circular dependencies in NEJ dependency list. (no-circular-dependencies)

Circular dependencies will lead to not only run-time errors but also build-time errors. They should be avoided by all means.

## Rule Details

Examples of **incorrect** code for this rule:

**a.js**
```js

NEJ.define([
  './b.js'
], function () {
  return {
    a: 1
  };
})

```

**b.js**
```js

NEJ.define([
  './a.js'
], function () {
  return {
    b: 1
  };
})

```

### Options

```js
  "rules": {
    "nej/no-circular-dependencies": ["error", {
      "ignoreNej": true // Default to true
    }]
  }
```
