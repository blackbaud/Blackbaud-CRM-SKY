/*jshint jasmine: true */

(function () {
    'use strict';

    describe('polyfill', function () {

        describe("String.format", function () {

            it("exists", function () {

                expect("a string".format).toBeDefined("String.format is not a function");

            });

            it("formats the string", function () {

                var expected = "this single string",
                    actual = "this {0} string".format("single");

                expect(actual).toBe(expected);

            });

            it("formats the string with missing parameters", function () {

                var expected = "this single {1} string",
                    actual = "this {0} {1} string".format("single");

                expect(actual).toBe(expected);

            });

            it("does not format non-numbers", function () {

                var expected = "this {a} string",
                    actual = "this {a} string".format("single");

                expect(actual).toBe(expected);

            });

        });

    });

}());
