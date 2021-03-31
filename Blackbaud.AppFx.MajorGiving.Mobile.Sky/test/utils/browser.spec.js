/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('utils.browser', function () {

        var browserUtilities,
            windowLocation,
            replaceCalled = false,
            replaceCalledWith;

        beforeEach(function () {

            replaceCalled = false;
            replaceCalledWith = null;

            windowLocation = {
                href: "http://MockHost/MockPath/sky/frog/?databaseName=BBInfinityMock",
                replace: function (replacementUrl) {
                    replaceCalled = true;
                    replaceCalledWith = replacementUrl;
                },
                search: "?databaseName=BBInfinityMock"
            };

            module('frog.util');

            module('infinity.util');

            module(function ($provide, mockableUtilitiesProvider) {

                var mockUtil = mockableUtilitiesProvider.$get();
                mockUtil.getWindowLocation = function () {
                    return windowLocation;
                };
                $provide.value("mockableUtilities", mockUtil);

            });

        });

        beforeEach(inject(function (_browserUtilities_) {
            browserUtilities = _browserUtilities_;
        }));

        it("factory exists", function () {
            expect(browserUtilities).toBeDefined("factory not defined");
        });

        describe("getWindowLocation", function () {

            it("returns the expected value", function () {

                var result = browserUtilities.getWindowLocation();

                expect(result).toEqual(windowLocation);

            });

        });

        describe("getQueryStringParameters", function () {

            it("parses database name", function () {

                var result = browserUtilities.getQueryStringParameters(),
                    expected;

                expected = {
                    databasename: "bbinfinitymock"
                };

                expect(result).toEqual(expected);

            });

            it("works with no query string", function () {
                
                windowLocation.href = "http://MockHost/MockPath/sky/frog/";
                windowLocation.search = "";

                var result = browserUtilities.getQueryStringParameters(),
                    expected;

                expected = { };

                expect(result).toEqual(expected);

            });

            it("works with empty query string", function () {

                windowLocation.href = "http://MockHost/MockPath/sky/frog/?";
                windowLocation.search = "";

                var result = browserUtilities.getQueryStringParameters(),
                    expected;

                expected = {};

                expect(result).toEqual(expected);

            });

            it("works with query parameter with no value", function () {

                windowLocation.href = "http://MockHost/MockPath/sky/frog/?someKey";
                windowLocation.search = "?someKey";

                var result = browserUtilities.getQueryStringParameters(),
                    expected;

                expected = {
                    somekey: null
                };

                expect(result).toEqual(expected);

            });

        });

        describe("redirect", function () {

            it("redirects the browser", function () {

                var expectedUrl = "http://blackbaud.com";

                browserUtilities.redirect(expectedUrl);

                expect(replaceCalled).toBe(true);
                expect(replaceCalledWith).toBe(expectedUrl);

            });

        });

    });

}());
