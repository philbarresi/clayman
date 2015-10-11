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

        var rules = compacted.nodes.filter(function (x) {
            return x.type === "rule";
        });

        var expandedRuleSet = {};

        rules.forEach((rule) => {
            var selectors = this.getAllSelectors(rule.selector);

            // start setting up your hash table
        });

        return {
            "a": 1
        };
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
