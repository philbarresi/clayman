var assert = require('chai').assert,
    clayman = require("../"),
    fs = require('fs'),
    path = require('path');

describe('Theme DNA', function () {
    describe("Selector extraction", function () {
        var base_str = " p, foo.bar, div.foo:first-child";

        it('should have 3 entries', function () {
            var selectors = clayman.getAllSelectors(base_str);

            assert.sameMembers(selectors, ["p", "foo.bar", "div.foo:first-child"]);
        });

        it('should trim whitespace', function () {
            var selectors = clayman.getAllSelectors(base_str);
            var firstSelector = selectors[0];

            assert.equal(firstSelector, "p");
        });

        it("should error when given a null selector", function () {
            assert.throw(function () {
                clayman.getAllSelectors(null);
            });
        });
    });

    describe('General', function () {

    });

    describe("diffing", function () {
        it('Should error when given no sources', function () {
            assert.throw(function () {
                clayman.diff();
            });
        });

        it('Should not throw when given 2 files', function () {
            var source1 = fs.readFileSync(path.join(__dirname, 'simple-style.css')).toString();
            var source2 = fs.readFileSync(path.join(__dirname, 'simple-style-2.css')).toString();

            var result = clayman.difference(source1, source2);
        });

        it('Should give a diff when comparing 2 bootstraps', function () {
            var source1 = fs.readFileSync(path.join(__dirname, 'bootstrap.css')).toString();
            var source2 = fs.readFileSync(path.join(__dirname, 'bootstrap-updated-bg-color.css')).toString();

            var result = clayman.difference(source1, source2);
            console.log(result.toString());
        });
    })

    describe("compacting", function () {
        it('Should be compacted', function () {
            var source = fs.readFileSync(path.join(__dirname, 'simple-style.css')).toString();

            var result = clayman.compact(source);
            assert.equal('purple', result.selectors.a.getRule('color'));
            assert.equal('center', result.selectors.a.getRule('text-align'));
            assert.equal('#999', result.selectors['p.foo'].getRule('background'));
        });

        it('Should be be compacting a responsive stylesheet', function () {
            var source = fs.readFileSync(path.join(__dirname, 'responsive-style.css')).toString();

            var result = clayman.compact(source);
            // console.log(result.toString());
            assert.equal('purple', result.selectors.a.getRule('color'));
            assert.equal('center', result.selectors.a.getRule('text-align'));
            assert.equal('#999', result.selectors['p.foo'].getRule('background'));
        });
    });
});