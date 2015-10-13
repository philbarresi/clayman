/// <reference path="./typings/node/node.d.ts"/>

var postcss = require('postcss');

module Clayman {
    function getAllSelectors(selector:string) {
        if (!selector) throw new ArgumentNullException("selector");

        return selector.split(",").map(function (selector) {
            return selector.trim();
        });
    }

    class ArgumentNullException implements Error {
        /**
         * Name of the exception
         *
         * @property name
         * @type String
         */
        public name:string = "ArgumentNullException";

        /**
         * The error message
         *
         * @property message
         * @type String
         */
        public message:string = "";

        /**
         * An error thrown indicating that an argument was null that should not be able to be null
         *
         * @class ArgumentNullException
         * @param {String} argName Name of the argument that could not be null
         * @constructor
         */
        constructor(private argName:string) {
            this.message = "Argument " + argName + " cannot be null";
        }
    }

    class SelectorRuleSet {
        /**
         * An identifier used to identify this selector rule set that will be composed by selectors, media queries, etc
         *
         * @property parent_identifier
         * @type string
         */
        public parent_identifier:string = "";

        /**
         * The CSS Selector applying to this rule set
         *
         * @property selector
         * @type string
         */
        public selector:string = "";

        /**
         * The has to determine the uniqueness of the styles for this selector / rule set
         *
         * @property hash
         * @private
         * @type String
         */
        private hash:string = "";

        /**
         * Set of rules representing the styles and their associated values
         *
         * @property rules
         * @type Object
         */
        public rules:{[key: string] : string} = {};

        /**
         * Gets the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @param {String} property The property name
         * @param {String} value The value
         * @method addRule
         * @return {String} The hash
         */
        public addRule(property:string, value:string) {
            if (!property) throw new ArgumentNullException("property");
            if (!value) throw new ArgumentNullException("value");

            var needsHashRegen = this.rules[property] !== value;

            this.rules[property] = value;

            if (needsHashRegen) {
                this.generateHash();
            }
        }

        /**
         * Gets the CSS rule for a property
         *
         * @param {String} property The property name
         * @method getRule
         * @return {String} The rule
         */
        public getRule(property:string):string {
            return this.rules[property];
        }

        /**
         * Gets the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @method getHash
         * @return {String} The hash
         */
        public getHash():string {
            return this.hash;
        }

        /**
         * Generates the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @method generateHash
         * @return {String} The hash
         */
        private generateHash() {
            var orderedKeys = Object.keys(this.rules).sort();

            var newHash = "";

            orderedKeys.forEach((ruleKey) => {
                newHash += ruleKey + ":" + this.rules[ruleKey] + "|";
            });

            this.hash = newHash;

            return newHash;
        }

        /**
         * Displays the rule set as a css string
         *
         * @method toString
         * @return {String} The result
         */
        public toString():string {
            var ruleKeys = Object.keys(this.rules);
            if (ruleKeys.length === 0) return "";

            var ret = this.selector + " {\n";

            ret += this.bodyString();

            ret += "\n}";

            return ret;
        }

        /**
         * Convenience function that returns the body of the CSS block as a string
         *
         * @method bodyString
         * @return {String} The result
         */
        public bodyString() {
            var ruleKeys = Object.keys(this.rules);
            if (ruleKeys.length === 0) return "";

            return ruleKeys.map((ruleKey) => {
                return "\t" + ruleKey + ": " + this.rules[ruleKey] + ";"
            }).join("\n");
        }

        /**
         * A set of rules for a particular CSS selector
         *
         * @class SelectorRuleSet
         * @param {String} selector The name of the CSS selector
         * @param {String} parent_identifier An identifier used to represent the parent of this CSS ruleset; ie, a media query
         * @constructor
         */
        constructor(selector:string, parent_identifier:string) {
            this.selector = selector;
            this.parent_identifier = parent_identifier;
        }
    }


    class StyleSheet {
        public selectors:{[key: string] : SelectorRuleSet} = {};

        /**
         * Outputs the plaintext representing the StyleSheet
         *
         * @method toString
         * @return {String} The result
         */
        public toString() {
            var keys = Object.keys(this.selectors);

            var ret = "";

            var identifierDict:{[key: string]: SelectorRuleSet[]} = {};

            keys.forEach((key:string)  => {
                var currSelector = this.selectors[key];

                if (!identifierDict[currSelector.parent_identifier]) {
                    identifierDict[currSelector.parent_identifier] = [];
                }

                var currentArray = identifierDict[currSelector.parent_identifier];
                currentArray.push(currSelector);
            });

            var identifierDictKeys = Object.keys(identifierDict);

            identifierDictKeys.forEach((identifierKey) => {
                var hashGroups:{[key: string]: SelectorRuleSet[]} = {}

                identifierDict[identifierKey].forEach((rule) => {
                    var hash = rule.getHash();

                    if (hashGroups[hash]) {
                        hashGroups[hash].push(rule);
                    } else {
                        hashGroups[hash] = [rule];
                    }
                });

                var currList = Object.keys(hashGroups).map((groupKey) => {
                    var group = hashGroups[groupKey];

                    var newSelector = group.map((entry) => {
                        return entry.selector
                    }).join(", ");

                    var ret = newSelector + " {\n";
                    ret += group[0].bodyString();
                    ret += "\n}";

                    return ret;
                }).filter((ruleStr) => {
                    return !!ruleStr;
                });

                if (currList.length === 0) return;

                var indent = false;

                if (identifierKey) {
                    indent = true;
                    ret += "\n@" + identifierKey + "{\n";
                }

                var ruleStringsJoined = currList.map((entry) => {
                    return entry;
                }).join("\n\n");

                if (indent) {
                    // add a tab
                    ruleStringsJoined = ruleStringsJoined.replace(/(^|\n)/g, '$1\t')
                }

                ret += ruleStringsJoined;

                if (identifierKey) {
                    ret += "\n}\n";
                }
            });

            return ret;
        }

        /**
         * Adds a set of rules to the StyleSheet
         *
         * @param {String} selector The CSS Selector
         * @param {String} parentIdentifier A way to identify the parent (root, media query, etc)
         * @param {Array} declarations An array of style declarations
         * @method addRuleSet
         */
        public addRuleSet(selector:string, parentIdentifier:string, declarations) {
            var identifier = (parentIdentifier ? parentIdentifier + "|" : '') + selector;

            if (!this.selectors[identifier]) {
                this.selectors[identifier] = new SelectorRuleSet(selector, parentIdentifier);
            }

            var ruleSet = this.selectors[identifier];

            declarations.forEach((declaration) => {
                ruleSet.addRule(declaration.prop, declaration.value);
            });
        }

        /**
         * Convenience Function; adds a node from parsecss to the stylesheet
         *
         * @param {Object} node The parseCSS node
         * @method addNode
         */
        public addNode(node) {
            var selectors = getAllSelectors(node.selector);

            var declarations = node.nodes.filter((node) => {
                return node.type === 'decl';
            });

            var parentIdentifier = "";

            if (node.parent.type === 'atrule') {
                parentIdentifier = node.parent.name + " " + node.parent.params;
            }

            selectors.forEach((selector) => {
                this.addRuleSet(selector, parentIdentifier, declarations);
            });
        }

        /**
         * Creates a new StyleSheet containing the difference between the current StyleSheet and another StyleSheet.
         *
         * @param {StyleSheet} other The StyleSheet to extract a difference against
         * @method difference
         * @return {StyleSheet} A StyleSheet representing the difference
         */
        public difference(other:StyleSheet):StyleSheet {
            if (!other) throw new ArgumentNullException("other");

            var ret = new StyleSheet();

            // We look for entire rules that other has that this stylesheet doesnot
            // We look for rules that they share, where there are new rules in other
            Object.keys(other.selectors).forEach((key) => {
                if (!this.selectors[key]) {
                    // we need to add it because `other` has something new
                    var ruleSet = other.selectors[key];

                    var rules = Object.keys(ruleSet.rules).map((rule) => {
                        return {prop: rule, value: ruleSet.rules[rule]};
                    });

                    ret.addRuleSet(ruleSet.selector, ruleSet.parent_identifier, rules)

                } else {
                    // ignore rules where they are shared
                    // if all rules are shared, ignore elements
                    // only add rules where they are different
                    var baseSet = this.selectors[key];
                    var otherSet = other.selectors[key];
                    var newRules:{prop: string, value: string}[] = [];

                    Object.keys(otherSet.rules).forEach((rule) => {
                        if (baseSet.rules[rule] !== otherSet.rules[rule]) {
                            newRules.push({prop: rule, value: otherSet.rules[rule]});
                        }
                    });

                    if (newRules.length > 0) {
                        ret.addRuleSet(baseSet.selector, baseSet.parent_identifier, newRules);
                    }
                }

            });

            return ret;
        }

        /**
         * Creates a new StyleSheet containing the combined properties and rules of the current StyleSheet and another.
         *
         * @param {StyleSheet} other The other StyleSheet
         * @method merge
         * @return {StyleSheet} A StyleSheet representing the union of the two
         */
        public merge(other:StyleSheet):StyleSheet {
            if (!other) throw new ArgumentNullException("other");

            var ret = new StyleSheet();

            Object.keys(this.selectors).forEach((key:string) => {
                var ruleSet = this.selectors[key];

                var rules = Object.keys(ruleSet.rules).map((rule) => {
                    return {prop: rule, value: ruleSet.rules[rule]};
                });

                ret.addRuleSet(ruleSet.selector, ruleSet.parent_identifier, rules)
            });

            Object.keys(other.selectors).forEach((key:string) => {
                var ruleSet = other.selectors[key];

                var rules = Object.keys(ruleSet.rules).map((rule) => {
                    return {prop: rule, value: ruleSet.rules[rule]};
                });

                ret.addRuleSet(ruleSet.selector, ruleSet.parent_identifier, rules)
            });

            return ret;
        }


        /**
         * A Representation of a StyleSheet
         *
         * @class StyleSheet
         * @constructor
         */
        constructor() {

        }
    }

    export class Clayman {
        /**
         * Takes two or more StyleSheets and returns a difference of their rules in a Clayman StyleSheet
         *
         * @method difference
         * @param {Array} sources An array of strings representing CSS Stylesheets
         * @return {StyleSheet} Returns a ClaymanStylesheet representing the difference
         * between the base and all other stylesheets
         */
        public difference(...sources:string[]):StyleSheet {
            if (sources.length == 0) throw Error("Must supply at least one source")

            var claymanSources = sources.map((source) => {
                return this.compact(source);
            });

            var base = claymanSources[0];
            var others = claymanSources.slice(1);
            var othersMerged = others.reduce((prev, curr) => {
                return prev.merge(curr);
            });

            var diff = base.difference(othersMerged);

            return diff;
        }

        /**
         * Takes a CSS string and converts it into a compacted Clayman StyleSheet
         *
         * @method compact
         * @param {String} source A string representing CSS styles
         * @return {StyleSheet} A Clayman StyleSheet of the source
         */
        public compact(source:string):StyleSheet {
            var compacted = this.postcss.parse(source);

            // We flatten out into one node array
            var nodes = [];

            var nodeDump = (node) => {
                if (node.type === 'rule') {
                    nodes.push(node);
                }
                else if (node.type === 'atrule') {
                    node.nodes.forEach(nodeDump);
                }
            };

            compacted.nodes.forEach(nodeDump);

            var stylesheet = new StyleSheet();

            nodes.forEach((node) => {
                stylesheet.addNode(node);
            });

            return stylesheet;
        }

        /**
         * Takes a CSS selector string (ie: ".foo, span.bar") and extracts all the individual selectors from it.
         *
         * @method getAllSelectors
         * @throws {Error} Cannot parse null selector or empty selector
         * @param {String} source A string representing any number of CSS selectors
         * @return {Array} Returns an array of strings with the selector names
         */
        public getAllSelectors(selector:string) {
            return getAllSelectors(selector);
        }

        /**
         * The main class of Clayman
         *
         * @class Clayman
         * @param {PostCSS} postcss An instance of PostCSS
         * @constructor
         */
        constructor(private postcss) {
        }
    }
}


export = new Clayman.Clayman(postcss);
