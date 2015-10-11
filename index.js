/// <reference path="./typings/node/node.d.ts"/>///
var postcss = require('postcss');
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
