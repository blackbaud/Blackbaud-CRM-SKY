/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getDatabaseName', function () {

        var API;

        beforeEach(function () {

            module('frog.resources');

            module('sky.moment');

            module('infinity.util');

            module(function ($provide, mockableUtilitiesProvider) {

                var mockUtil = mockableUtilitiesProvider.$get();
                mockUtil.getWindowLocation = function () {
                    return {
                        href: "http://MockHost/MockPath/sky/frog/?databaseName=BBInfinityMock",
                        search: '?databaseName=BBInfinityMock'
                    };
                };
                $provide.value("mockableUtilities", mockUtil);

            });

            module('frog.api');

        });

        beforeEach(inject(function (_api_) {
            API = _api_;
        }));

        beforeEach(function () {
            API.initialize();
        });

        it("returns the expected value", function () {
            expect(API.getDatabaseName()).toBe("bbinfinitymock");
        });

    });

}());
