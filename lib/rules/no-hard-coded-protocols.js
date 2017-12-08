/**
 * @fileoverview Forbids hard-coded protocols.
 * @author Andy Zhou
 */
"use strict";

var path = require('path');
var debug = require('debug');
var ruleId = path.basename(__filename).replace(path.extname(__filename), '');

var ruleDebug = debug('plugin-rules:' + ruleId);

module.exports = {
    meta: {
        docs: {
            description: "Forbids hard-coded protocols.",
            recommended: true
        },
        fixable: "code", // or "code" or "whitespace"
        schema: [{
            type: 'object',
            properties: {
                colon: {
                    type: 'boolean'
                },
            }
        }]
    },

    create: function (context) {
        var options = context.options && context.options.length ? context.options : [{
            colon: false,
        }];
        ruleDebug('Current options', options)
        var re = new RegExp('https?' + (options[0].colon ? ':' : ''));
        var replaceRe = new RegExp(re.source + (options[0].colon ? '' : ':') + '\/\/', 'g');
        var replaced = '//';
        ruleDebug('Current RegExp', re)
        ruleDebug('Current Replace RegExp', replaceRe)
        function checkAnReport(str, node) {
            if (re.test(str)) {
                context.report({
                    message: 'Do not use hard-coded protocols. Use window.location.protocol instead.',
                    node: node,
                    fix: function (fixer) {
                        return fixer.replaceText(node, node.raw.replace(replaceRe, replaced));
                    }
                });
            }
        }

        return {
            TemplateElement: function (node) {
                var strValue = node.value.raw;

                if (typeof strValue === 'string') {
                    checkAnReport(strValue, node);
                }
            },
            Literal: function (node) {
                if (typeof node.value === 'string') {
                    checkAnReport(node.value, node);
                }
            }
        };
    }
};