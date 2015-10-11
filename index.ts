/// <reference path="./typings/node/node.d.ts"/>///

var postcss = require('postcss');

class Clayman {
    public selectorRuleSet(selector:string, rules) {
        return {
            selector: selector,
            rules: rules
        }
    }

    
    public compact(source) {
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
