/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('sky resource overrides', function () {

        var bbResources;

        beforeEach(function () {

            module('sky.resources');

        });

        beforeEach(inject(function (_bbResources_) {
            bbResources = _bbResources_;
        }));

        it("grid_search_placeholder", function () {
            expect(bbResources.grid_search_placeholder).toBe("Search in this list");
        });

    });

}());
