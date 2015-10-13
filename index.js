/// <reference path="./typings/node/node.d.ts"/>
var postcss = require('postcss');
var Clayman;
(function (Clayman_1) {
    function getAllSelectors(selector) {
        if (!selector)
            throw new ArgumentNullException("selector");
        return selector.split(",").map(function (selector) {
            return selector.trim();
        });
    }
    var ArgumentNullException = (function () {
        /**
         * An error thrown indicating that an argument was null that should not be able to be null
         *
         * @class ArgumentNullException
         * @param {String} argName Name of the argument that could not be null
         * @constructor
         */
        function ArgumentNullException(argName) {
            this.argName = argName;
            /**
             * Name of the exception
             *
             * @property name
             * @type String
             */
            this.name = "ArgumentNullException";
            /**
             * The error message
             *
             * @property message
             * @type String
             */
            this.message = "";
            this.message = "Argument " + argName + " cannot be null";
        }
        return ArgumentNullException;
    })();
    var SelectorRuleSet = (function () {
        /**
         * A set of rules for a particular CSS selector
         *
         * @class SelectorRuleSet
         * @param {String} selector The name of the CSS selector
         * @param {String} parent_identifier An identifier used to represent the parent of this CSS ruleset; ie, a media query
         * @constructor
         */
        function SelectorRuleSet(selector, parent_identifier) {
            /**
             * An identifier used to identify this selector rule set that will be composed by selectors, media queries, etc
             *
             * @property parent_identifier
             * @type string
             */
            this.parent_identifier = "";
            /**
             * The CSS Selector applying to this rule set
             *
             * @property selector
             * @type string
             */
            this.selector = "";
            /**
             * The has to determine the uniqueness of the styles for this selector / rule set
             *
             * @property hash
             * @private
             * @type String
             */
            this.hash = "";
            /**
             * Set of rules representing the styles and their associated values
             *
             * @property rules
             * @type Object
             */
            this.rules = {};
            this.selector = selector;
            this.parent_identifier = parent_identifier;
        }
        /**
         * Gets the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @param {String} property The property name
         * @param {String} value The value
         * @method addRule
         * @return {String} The hash
         */
        SelectorRuleSet.prototype.addRule = function (property, value) {
            if (!property)
                throw new ArgumentNullException("property");
            if (!value)
                throw new ArgumentNullException("value");
            var needsHashRegen = this.rules[property] !== value;
            this.rules[property] = value;
            if (needsHashRegen) {
                this.generateHash();
            }
        };
        /**
         * Gets the CSS rule for a property
         *
         * @param {String} property The property name
         * @method getRule
         * @return {String} The rule
         */
        SelectorRuleSet.prototype.getRule = function (property) {
            return this.rules[property];
        };
        /**
         * Gets the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @method getHash
         * @return {String} The hash
         */
        SelectorRuleSet.prototype.getHash = function () {
            return this.hash;
        };
        /**
         * Generates the hash identifying this selector's rules, so uniqueness can be determined
         *
         * @method generateHash
         * @return {String} The hash
         */
        SelectorRuleSet.prototype.generateHash = function () {
            var _this = this;
            var orderedKeys = Object.keys(this.rules).sort();
            var newHash = "";
            orderedKeys.forEach(function (ruleKey) {
                newHash += ruleKey + ":" + _this.rules[ruleKey] + "|";
            });
            this.hash = newHash;
            return newHash;
        };
        SelectorRuleSet.prototype.toString = function () {
            var _this = this;
            var ruleKeys = Object.keys(this.rules);
            if (ruleKeys.length === 0)
                return "";
            var ret = this.selector + " {";
            ret += "\n";
            ret += ruleKeys.map(function (ruleKey) {
                return "\t" + ruleKey + ": " + _this.rules[ruleKey] + ";";
            }).join("\n");
            ret += "\n}";
            return ret;
        };
        return SelectorRuleSet;
    })();
    var StyleSheet = (function () {
        function StyleSheet() {
            this.selectors = {};
        }
        StyleSheet.prototype.media = function (node) {
            return "";
        };
        StyleSheet.prototype.toString = function () {
            var _this = this;
            var keys = Object.keys(this.selectors);
            var ret = "";
            var identifierDict = {};
            keys.forEach(function (key) {
                var currSelector = _this.selectors[key];
                if (!identifierDict[currSelector.parent_identifier]) {
                    identifierDict[currSelector.parent_identifier] = [];
                }
                var currentArray = identifierDict[currSelector.parent_identifier];
                currentArray.push(currSelector);
            });
            var identifierDictKeys = Object.keys(identifierDict);
            identifierDictKeys.forEach(function (identifierKey) {
                var currList = identifierDict[identifierKey].map(function (rule) {
                    return rule.toString();
                }).filter(function (ruleStr) {
                    return !!ruleStr;
                });
                if (currList.length === 0)
                    return;
                var indent = false;
                if (identifierKey) {
                    indent = true;
                    ret += "\n@" + identifierKey + "{\n";
                }
                var ruleStringsJoined = currList.join("\n");
                if (indent) {
                    // add a tab
                    ruleStringsJoined = ruleStringsJoined.replace(/(^|\n)/g, '$1\t');
                }
                ret += ruleStringsJoined;
                if (identifierKey) {
                    ret += "\n}\n";
                }
            });
            return ret;
        };
        // one day we'll figure out how to get postcss' definitions working...
        StyleSheet.prototype.addNode = function (node) {
            var _this = this;
            var selectors = getAllSelectors(node.selector);
            var declarations = node.nodes.filter(function (node) {
                return node.type === 'decl';
            });
            var parentIdentifier = "";
            if (node.parent.type === 'atrule') {
                parentIdentifier = node.parent.name + " " + node.parent.params;
            }
            selectors.forEach(function (selector) {
                var identifier = (parentIdentifier ? parentIdentifier + "|" : '') + selector;
                if (!_this.selectors[identifier]) {
                    _this.selectors[identifier] = new SelectorRuleSet(selector, parentIdentifier);
                }
                var ruleSet = _this.selectors[identifier];
                declarations.forEach(function (declaration) {
                    ruleSet.addRule(declaration.prop, declaration.value);
                });
            });
        };
        return StyleSheet;
    })();
    var Clayman = (function () {
        /**
         * The main class of Clayman
         *
         * @class Clayman
         * @param {PostCSS} postcss An instance of PostCSS
         * @constructor
         */
        function Clayman(postcss) {
            this.postcss = postcss;
        }
        /**
         * Takes a CSS string and converts it into a set of selectors -> rules,
         * removing redundancy for each selector.
         *
         * @method compact
         * @param {String} source A string representing CSS styles
         * @return {Object} Returns an object with selector name -> {prop: value}
         */
        Clayman.prototype.compact = function (source) {
            var compacted = this.postcss.parse(source);
            // We flatten out into one node array
            var nodes = [];
            var nodeDump = function (node) {
                if (node.type === 'rule') {
                    nodes.push(node);
                }
                else if (node.type === 'atrule') {
                    node.nodes.forEach(nodeDump);
                }
            };
            compacted.nodes.forEach(nodeDump);
            var stylesheet = new StyleSheet();
            nodes.forEach(function (node) {
                stylesheet.addNode(node);
            });
            return stylesheet;
        };
        /**
         * Takes a CSS selector string (ie: ".foo, span.bar") and extracts all the individual selectors from it.
         *
         * @method getAllSelectors
         * @throws {Error} Cannot parse null selector or empty selector
         * @param {String} source A string representing any number of CSS selectors
         * @return {Array} Returns an array of strings with the selector names
         */
        Clayman.prototype.getAllSelectors = function (selector) {
            return getAllSelectors(selector);
        };
        return Clayman;
    })();
    Clayman_1.Clayman = Clayman;
})(Clayman || (Clayman = {}));
module.exports = new Clayman.Clayman(postcss);
