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

    describe("compacting", function () {
        it('Should be compacted', function (done) {
            fs.readFile(path.join(__dirname, 'simple-style.css'), 'utf8', function (err, source) {
                if (err) throw err;

                var result = clayman.compact(source);
                assert.equal('purple', result.selectors.a.getRule('color'));
                assert.equal('center', result.selectors.a.getRule('text-align'));
                assert.equal('#999', result.selectors['p.foo'].getRule('background'));

                done();
            });
        });

        it('Should be be compacting a responsive stylesheet', function (done) {
            fs.readFile(path.join(__dirname, 'responsive-style.css'), 'utf8', function (err, source) {
                if (err) throw err;

                var result = clayman.compact(source);
                console.log(result.toString());
                assert.equal('purple', result.selectors.a.getRule('color'));
                assert.equal('center', result.selectors.a.getRule('text-align'));
                assert.equal('#999', result.selectors['p.foo'].getRule('background'));

                done();
            });
        });
    });
});