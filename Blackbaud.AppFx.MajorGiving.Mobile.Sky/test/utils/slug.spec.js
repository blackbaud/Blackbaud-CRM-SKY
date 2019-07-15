/*jshint browser: true, jasmine: true */
/*global describe, beforeEach, it, module, inject, expect */

(function () {
    'use strict';

    describe('slug', function () {

        var slug;

        beforeEach(function () {
            module('frog.util');
            module('infinity.util');
        });

        beforeEach(inject(function (_slug_) {
            slug = _slug_;
        }));

        it("factory exists", function () {
            expect(slug).toBeDefined("factory not defined");
        });

        describe("prependSlug", function () {

            it("works with empty text", function () {

                var text = "",
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with null text", function () {

                var text = null,
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with non-string text", function () {

                var text = 8,
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with upper case", function () {

                var text = "Robert Hernandez",
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = "robert-hernandez-" + id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with trailing spaces", function () {

                var text = "  Robert Hernandez  ",
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = "robert-hernandez-" + id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with trailing question mark", function () {

                var text = "Robert Hernandez? ",
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = "robert-hernandez-" + id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("replaces symbols and spaces", function () {

                var text = "R-o.bert        H*e'r?n!andez1",
                    id = "b2a720af-7f64-4614-92c9-2934d77ffe5e",
                    expectedResult = "r-o-bert-hernandez1-" + id,
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

            it("works with null id", function () {

                var text = "Robert Hernandez",
                    id = null,
                    expectedResult = "robert-hernandez-null",
                    actualResult = slug.prependSlug(text, id);

                expect(actualResult).toBe(expectedResult);

            });

        });

    });

}());