/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api initialize', function () {

        var bbuiShellServiceConfig,
            API;

        beforeEach(function () {

            module('frog.resources');

            module('sky.moment');

            module('infinity.util');

            module('frog.api');

            module(function ($provide, mockableUtilitiesProvider) {

                var mockUtil = mockableUtilitiesProvider.$get();
                mockUtil.getWindowLocation = function () {
                    return {
                        href: "http://MockHost/MockPath/sky/frog/?databaseName=BBInfinityMock",
                        search: "?databaseName=BBInfinityMock"
                    };
                };
                $provide.value("mockableUtilities", mockUtil);

            });

        });

        beforeEach(inject(function (_bbuiShellServiceConfig_, _api_) {
            bbuiShellServiceConfig = _bbuiShellServiceConfig_;
            API = _api_;
        }));

        // This test must be first so the API is not initialized.
        it("sets expected values", function () {

            expect(bbuiShellServiceConfig.baseUrl).toBe(null);
            expect(bbuiShellServiceConfig.databaseName).toBe(null);

            API.initialize();

            expect(bbuiShellServiceConfig.baseUrl).toBe("/MockPath");
            expect(bbuiShellServiceConfig.databaseName).toBe("bbinfinitymock");

        });

    });

}());
