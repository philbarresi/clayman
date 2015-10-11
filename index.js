/// <reference path="./typings/node/node.d.ts"/>///
var postcss = require('postcss');
/**
 * This is the main class of Clayman
 *
 * @class Clayman
 * @constructor
 */
var Clayman = (function () {
    function Clayman(postcss) {
        this.postcss = postcss;
    }
    Clayman.prototype.selectorRuleSet = function (selector, rules) {
        return {
            selector: selector,
            rules: rules
        };
    };
    /**
     * Takes a CSS string and converts it into a set of selectors -> rules,
     * removing redundancy for each selector.
     *
     * @method compact
     * @param {String} source A string representing CSS styles
     * @return {Object} Returns an object with selector name -> {prop: value}
     */
    Clayman.prototype.compact = function (source) {
        var _this = this;
        var compacted = this.postcss.parse(source);
        var rules = compacted.nodes.filter(function (x) {
            return x.type === 'rule';
        });
        var expandedRuleSet = {};
        // start setting up your hash table
        rules.forEach(function (rule) {
            var selectors = _this.getAllSelectors(rule.selector);
            var declarations = rule.nodes.filter(function (node) {
                return node.type === 'decl';
            });
            selectors.forEach(function (selector) {
                var rules = expandedRuleSet[selector] || {};
                declarations.forEach(function (declaration) {
                    rules[declaration.prop] = declaration.value;
                });
                expandedRuleSet[selector] = rules;
            });
        });
        return expandedRuleSet;
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
        if (!selector)
            throw "Cannot parse null selector or empty selector";
        return selector.split(",").map(function (selector) {
            return selector.trim();
        });
    };
    return Clayman;
})();
module.exports = new Clayman(postcss);
