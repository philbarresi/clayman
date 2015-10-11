var assert = require('chai').assert,
    themeDna = require("../"),
    fs = require('fs'),
    path = require('path');

describe('Theme DNA', function () {
    describe("Selector extraction", function () {
        var base_str = " p, foo.bar, div.foo:first-child";

        it('should have 3 entries', function () {
            var selectors = themeDna.getAllSelectors(base_str);

            assert.sameMembers(selectors, ["p", "foo.bar", "div.foo:first-child"]);
        });

        it('should trim whitespace', function () {
            var selectors = themeDna.getAllSelectors(base_str);
            var firstSelector = selectors[0];

            assert.equal(firstSelector, "p");
        });

        it("should error when given a null selector", function() {
            assert.throw(function() {
                themeDna.getAllSelectors(null);
            }, 'Cannot parse null selector or empty selector');
        });
    });

    describe("compacting", function () {
        it('Should be compacted', function (done) {
            fs.readFile(path.join(__dirname, 'simple-style.css'), 'utf8', function (err, source) {
                if (err) throw err;

                var result = themeDna.compact(source, 1);
                assert.equal('purple', result.a.color);
                assert.equal('center', result.a['text-align']);
                assert.equal('#999', result['p.foo'].background);

                done();
            });

        });
    });
});