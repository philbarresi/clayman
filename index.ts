/// <reference path="./typings/node/node.d.ts"/>///

var postcss = require('postcss');

/**
 * This is the main class of Clayman
 *
 * @class Clayman
 * @constructor
 */
class Clayman {
    public selectorRuleSet(selector:string, rules) {
        return {
            selector: selector,
            rules: rules
        }
    }

    /**
     * Takes a CSS string and converts it into a set of selectors -> rules,
     * removing redundancy for each selector.
     *
     * @method compact
     * @param {String} source A string representing CSS styles
     * @return {Object} Returns an object with selector name -> {prop: value}
     */
    public compact(source: string) {
        var compacted = this.postcss.parse(source);

        var rules = compacted.nodes.filter((x) => {
            return x.type === 'rule';
        });

        var expandedRuleSet: {[element: string]: {[property: string]: string}} = {};

        // start setting up your hash table
        rules.forEach((rule) => {
            var selectors = this.getAllSelectors(rule.selector);
            var declarations = rule.nodes.filter((node) => {
               return node.type === 'decl';
            });

            selectors.forEach((selector) => {
                var rules = expandedRuleSet[selector] || {};

                declarations.forEach((declaration) => {
                   rules[declaration.prop] = declaration.value;
                });

                expandedRuleSet[selector] = rules;
            });
        });

        return expandedRuleSet;
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
        if (!selector) throw "Cannot parse null selector or empty selector";

        return selector.split(",").map(function (selector) {
            return selector.trim();
        });
    }

    constructor(private postcss) {
    }
}


export = new Clayman(postcss);
