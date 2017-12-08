/**
 * @fileoverview Forbids hard-coded protocols.
 * @author Andy Zhou
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-hard-coded-protocols"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-hard-coded-protocols", rule, {
    valid: [{
        code: '"//www.example.com"'
    }, {
        code: `
        NEJ.define([], function () {
            var newUrl = 'https' + url.replace('http', '');
        });
        `,
        options: [{
            colon: true
        }],
    }],
    invalid: [{
            code: '"http"',
            errors: [{
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }],
            output: '"http"'
        },
        {
            code: '"http://www.example.com"',
            errors: [{
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }],
            output: '"//www.example.com"'
        },
        {
            code: '\'http://www.example.com\'',
            errors: [{
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }],
            output: '\'//www.example.com\''
        },
        {
            code: '\'http://www.example.com/?someUrl=https://www.a.com\'',
            errors: [{
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }],
            output: '\'//www.example.com/?someUrl=//www.a.com\''
        },
        {
            code: '\'http://www.example.com/?someUrl=https://www.a.com\';\n\
\'http://www.example.com/?someUrl=https://www.a.com\';',
            errors: [{
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }, {
                message: 'Do not use hard-coded protocols. Use window.location.protocol instead.'
            }],
            output: '\'//www.example.com/?someUrl=//www.a.com\'\;\n\
\'//www.example.com/?someUrl=//www.a.com\';'
        }, {
            code: `
            NEJ.define([], function () {
                var url = 'http://www.example.com';

                var newUrl = 'https:' + url.replace('http:', '');
            });
            `,
            errors: 3
        }
    ]
});