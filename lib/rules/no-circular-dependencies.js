/**
 * @fileoverview Forbids circular dependencies in NEJ dependency list.
 * @author Andy Zhou
 */
"use strict";

var logs = '';
var utils = require('./../utils');
var benchmark = require('./../utils/benchmark');
var path = require('path');
var ruleId = path.basename(__filename).replace(path.extname(__filename), '');
var fs = require('fs');
var mkdirp = require('mkdirp');
var traverser = require('eslint/lib/util/traverser')();
var ruleDebug = require('debug')(ruleId);
var tdDebug = require('debug')(ruleId + ':traceDependencies');
var rdgDebug = require('debug')(ruleId + ':resolveDependencyGraph');
var ccDebug = require('debug')(ruleId + ':checkCircular');
var map = utils.map;
var find = utils.find;
var forOwn = utils.forOwn;
var forEach = utils.forEach;
var nejRE = /nej\/src/;

function getLogger() {
    /* eslint-disable no-console */
    return function () {
        logs += (Array.from(arguments).join(' ') + '\n');
        return console.error.apply(console, arguments);
    };
    /* eslint-enable no-console */
}

if (process.env.NODE_ENV === 'test') {
    ruleDebug.log = getLogger();
    tdDebug.log = getLogger();
    rdgDebug.log = getLogger();
    ccDebug.log = getLogger();

    process.on('exit', function () {
        var outFile = path.resolve(__dirname, '../../logs/', Date.now().toString() + '.log');
        mkdirp.sync(path.dirname(outFile));
        fs.writeFileSync(outFile, logs, 'utf-8');
    });
}

if (process.env.NODE_ENV === 'bench') {
    process.on('exit', function () {
        var outFile = path.resolve(__dirname, '../../benchmark/', Date.now().toString() + '.log');
        mkdirp.sync(path.dirname(outFile));
        fs.writeFileSync(outFile, benchmark.getResults(), 'utf-8');
    });
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

function isDefineCall(node) {
    return node.callee.type === 'Identifier' &&
        node.callee.name === 'define';
}

function isNejDefineCall(node) {
    return node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'NEJ' &&
        node.callee.property.name === 'define';
}

function normalizeSlashes(path) {
    return path.replace(/[\/\\]+/g, '/');
}

function replaceWithNejPathAliases(path, nejPathAliases) {
    forOwn(nejPathAliases, function (val, key) {
        var re = new RegExp('^' + key + '|' + '{' + key + '}', 'g');

        path = normalizeSlashes(path.replace(re, val));
    });

    return path;
}

function removeNejPlugins(path) {
    return path.replace(/^.*?\!/, '');
}

function addExt(p) {
    var basename = path.basename(p);

    if (/\./.test(basename)) {
        return p;
    } else {
        return p + '.js';
    }
}

function normalizeDependencyPath(dep, curFilename, nejPathAliases) {
    var baseDir = process.cwd();
    var curFileDirname = normalizeSlashes(path.dirname(curFilename));
    dep = replaceWithNejPathAliases(removeNejPlugins(dep), nejPathAliases);

    if (/^\./.test(dep)) {
        return addExt(normalizeSlashes(path.resolve(curFileDirname, dep)));
    } else {
        return addExt(normalizeSlashes(path.resolve(baseDir, dep)));
    }
}

module.exports = {
    meta: {
        docs: {
            description: "Forbids circular dependencies in NEJ dependency list.",
            recommended: true
        },
        fixable: null,
        schema: [{
            type: 'object',
            properties: {
                ignoreNej: {
                    type: 'boolean'
                }
            }
        }]
    },

    create: (function () {
        var dependencyMap = {},
            circularDependencyMap = {},
            parser,
            parserOptions,
            nejPathAliases,
            ruleOptions = {
                ignoreNej: true
            };

        function ignoreNej(filename) {
            return !!(ruleOptions.ignoreNej && nejRE.test(filename));
        }

        function resolveDependencyGraph(filename) {
            if (!/\.js$/.test(filename)) {
                rdgDebug('Since the the file is not js file, skipping...');
                return;
            }
            rdgDebug('Resolving dependencies of ' + filename);

            if (!dependencyMap[filename]) {
                rdgDebug('Since the dependencies of the file is not resolved');
                var fileContent;
                try {
                    fileContent = fs.readFileSync(filename).toString('utf-8');
                } catch (error) {
                    rdgDebug('File not found:', filename);
                }

                if (fileContent && parser) {
                    rdgDebug('Parsing the file...');
                    var ast = parser.parse(fileContent, parserOptions);

                    rdgDebug('Traversing the file...');
                    traverser.traverse(ast, {
                        enter: function (node, parent) {
                            node.parent = parent;
                            if (node.type === 'CallExpression') {
                                getCallExpVisitor(nejPathAliases, filename).call(this, node);
                            }
                        }
                    });

                    if (dependencyMap[filename]) {
                        rdgDebug('Resolved dependencies:', dependencyMap[filename]);

                        forEach(dependencyMap[filename], function (dep) {
                            resolveDependencyGraph(dep);
                        });
                    } else {
                        rdgDebug('Dependencies of the file is not resolved');
                    }
                }
            } else {
                rdgDebug('Since the dependencies of the file is already resolved, skipping...');
            }
        }

        function getCallExpVisitor(nejPathAliases, curFilename, context) {
            return function (node) {
                var dependencies = [];

                if (isDefineCall(node) ||
                    isNejDefineCall(node)) {
                    ruleDebug('Found a NEJ define call in ', curFilename);

                    var depArrExp = find(node.arguments, function (a) {
                        return a.type === 'ArrayExpression';
                    });

                    if (depArrExp) {
                        dependencies = map(depArrExp.elements, function (e) {
                            return normalizeDependencyPath(e.value, curFilename, nejPathAliases);
                        });

                        if (context) {
                            ruleDebug('Since it is in ESLint rule traversal, checking circular...')
                            forEach(depArrExp.elements, function (el, i) {
                                if (/\.js$/.test(dependencies[i])) {
                                    checkCircular(context, el, dependencies[i]);
                                }
                            });
                        }
                    }

                    dependencyMap[curFilename] = dependencies;

                    if (this.break) {
                        ruleDebug('Since it is not in ESLint rule traversal, breaking out of the traversal...');
                        this.break();
                    }
                }
            };
        }

        function traceDependencies(result, filename, visited, curPathMap) {
            if (result.circular) {
                return;
            }

            visited = visited || {};
            curPathMap = curPathMap || {};

            var deps = dependencyMap[filename];

            if (curPathMap[filename]) {
                if (!ignoreNej(filename)) {
                    result.circular = true;
                    tdDebug('The file', filename, 'is already in the current visiting path. Circular dependencies found.');
                }

                return;
            }

            curPathMap[filename] = true;

            if (deps) {
                for (var i = 0, l = deps.length, dep; i < l; i++) {
                    dep = deps[i];

                    if (!visited[dep]) {
                        visited[dep] = true;
                        tdDebug('Visiting', dep);
                        traceDependencies(result, dep, visited, curPathMap);
                    }
                }
            } else {
                tdDebug('The dependencies of file ' + filename + ' is not resolved, resolving...')
                var bid = benchmark.genBenchId('resolveDependencyGraph', filename)
                benchmark.start(bid);
                resolveDependencyGraph(filename);
                benchmark.end(bid);
            }

            delete curPathMap[filename];
        }

        function checkCircular(context, node, filename) {
            filename = normalizeSlashes(filename);
            ccDebug('Checking circular dependencies of the file:', filename);

            if (ruleOptions.ignoreNej &&
                /nej\/src/.test(filename)) {
                ccDebug('The options ignoreNej is true, skipping...');
                return;
            }

            var deps = dependencyMap[filename];
            var error = {
                node: node,
                message: 'There may be a circular dependency in the file ' + filename
            };

            if (circularDependencyMap[filename]) {
                ccDebug('Since this file has already been marked as having circular dependencies, reporting...');
                return context.report(error);
            }

            var bid = benchmark.genBenchId('resolveDependencyGraph', filename)
            benchmark.start(bid);
            if (deps) {
                forEach(deps, function (dep) {
                    resolveDependencyGraph(dep);
                });
            } else {
                resolveDependencyGraph(filename);
            }
            benchmark.end(bid);

            if (typeof circularDependencyMap[filename] === 'undefined') {
                var result = {
                    circular: false
                };

                ccDebug('Tracing dependencies and checking for circular dependencies...');
                bid = benchmark.genBenchId('traceDependencies', filename)
                benchmark.start(bid);
                traceDependencies(result, filename);
                benchmark.end(bid);
                circularDependencyMap[filename] = result.circular;

                if (result.circular) {
                    return context.report(error);
                }
            }
        }

        return function (context) {
            var filename = normalizeSlashes(context.getFilename());
            parser = require(context.parserPath);
            parserOptions = context.parserOptions;
            nejPathAliases = context.settings.nejPathAliases;
            ruleOptions = context.options[0] || ruleOptions;

            ruleDebug('Linting ' + filename);

            return {
                CallExpression: getCallExpVisitor(nejPathAliases, filename, context)
            };
        }
    })()
};