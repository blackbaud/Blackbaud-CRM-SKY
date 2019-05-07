/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('utils.mapping', function () {

        var mapping,
            baseMapUrl;

        beforeEach(function () {

            module("frog.util");

            baseMapUrl = "http://maps.google.com/?q=";

        });

        beforeEach(inject(function (_mapping_) {
            mapping = _mapping_;
        }));

        it("factory exists", function () {
            expect(mapping).toBeDefined("factory not defined");
        });

        describe("getMapUrl", function () {

            it("returns the expected value", function () {

                var result = mapping.getMapUrl("testquery");

                expect(result).toEqual(baseMapUrl + "testquery");

            });

            it("encodes the search terms", function () {

                var result = mapping.getMapUrl("Test#?& query");

                expect(result).toEqual(baseMapUrl + "Test%23%3F%26%20query");

            });

            it("works with no parameters", function () {

                var result = mapping.getMapUrl();

                expect(result).toEqual(baseMapUrl);

            });

            it("works with null query", function () {

                var result = mapping.getMapUrl(null);

                expect(result).toEqual(baseMapUrl);

            });

            it("works with empty query", function () {

                var result = mapping.getMapUrl("");

                expect(result).toEqual(baseMapUrl);

            });

        });

    });

}());
