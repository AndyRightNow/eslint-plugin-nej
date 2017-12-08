/**
 * @fileoverview Forbids circular dependencies in NEJ dependency list.
 * @author Andy Zhou
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-circular-dependencies"),
    RuleTester = require("eslint").RuleTester,
    path = require('path'),
    fs = require('fs');

var fixtureFolderName = 'fixtures/no-circular-dependencies';

RuleTester.setDefaultConfig({
    settings: {
        nejPathAliases: {
            pro: fixtureFolderName + '/'
        }
    },
    rules: {
        'no-circular-dependencies': 2
    }
});

//------------------------------------------------------------------------------
// Invalid tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

var aFilePathValid = path.resolve(process.cwd(), fixtureFolderName, 'no-circular', 'a.js'),
    bFilePathValid = path.resolve(process.cwd(), fixtureFolderName, 'no-circular', 'b.js'),
    cFilePathValid = path.resolve(process.cwd(), fixtureFolderName, 'no-circular', 'c.js'),
    aFilePathInvalid = path.resolve(process.cwd(), fixtureFolderName, 'circular', 'a.js'),
    bFilePathInvalid = path.resolve(process.cwd(), fixtureFolderName, 'circular', 'b.js'),
    cFilePathInvalid = path.resolve(process.cwd(), fixtureFolderName, 'circular', 'c.js');

ruleTester.run("no-circular-dependencies", rule, {
    valid: [{
        code: fs.readFileSync(aFilePathValid).toString('utf-8'),
        filename: aFilePathValid
    }, {
        code: fs.readFileSync(bFilePathValid).toString('utf-8'),
        filename: bFilePathValid
    }, {
        code: fs.readFileSync(cFilePathValid).toString('utf-8'),
        filename: cFilePathValid
    }],
    invalid: [{
        code: fs.readFileSync(aFilePathInvalid).toString('utf-8'),
        filename: aFilePathInvalid,
        errors: 1
    }, {
        code: fs.readFileSync(bFilePathInvalid).toString('utf-8'),
        filename: bFilePathInvalid,
        errors: 1
    }, {
        code: fs.readFileSync(cFilePathInvalid).toString('utf-8'),
        filename: cFilePathInvalid,
        errors: 2
    }]
});