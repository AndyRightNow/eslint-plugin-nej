/**
 * @fileoverview Forbids circular dependencies in NEJ dependency list.
 * @author Andy Zhou
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Forbids circular dependencies in NEJ dependency list.",
            recommended: true
        },
        fixable: null, // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: (function () {
        return function (context) {

            // variables should be defined here

            //----------------------------------------------------------------------
            // Helpers
            //----------------------------------------------------------------------

            // any helper functions should go here or else delete this section

            //----------------------------------------------------------------------
            // Public
            //----------------------------------------------------------------------

            return {

                // give me methods

            };
        }
    })()
};