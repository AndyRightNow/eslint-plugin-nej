/**
 * @fileoverview Forbids circular dependencies in NEJ dependency list.
 * @author Andy Zhou
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-circular-dependencies"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-circular-dependencies", rule, {

    valid: [
        'NEJ.define([], function () {});'
        
    ],
    invalid: []
});