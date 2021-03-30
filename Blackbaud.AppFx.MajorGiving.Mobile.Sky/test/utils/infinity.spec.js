/*jshint jasmine: true */
/*globals module, inject, angular */

(function () {
    'use strict';

    describe('utils.infinity', function () {

        var infinityUtilities;

        beforeEach(function () {

            module('sky.moment');

            module('frog.util');

            module('infinity.util');

            module(function ($provide, mockableUtilitiesProvider) {

                var mockUtil = mockableUtilitiesProvider.$get();
                mockUtil.getWindowLocation = function () {
                    return {
                        href: "http://MockHost/MockPath/sky/frog/?databaseName=BBInfinityMock",
                        replace: angular.noop,
                        search: "?databaseName=BBInfinityMock"
                    };
                };
                $provide.value("mockableUtilities", mockUtil);

            });

            module('frog.api');

        });

        beforeEach(inject(function (_infinityUtilities_) {
            infinityUtilities = _infinityUtilities_;

            infinityUtilities.initialize("frog", false);
        }));

        it("factory exists", function () {
            expect(infinityUtilities).toBeDefined("factory not defined");
        });

        describe("getVirtualDirectory", function () {

            it("returns the expected value", function () {

                var result = infinityUtilities.getVirtualDirectory(),
                    expected = "MockPath";

                expect(result).toBe(expected);

            });

        });

        describe("getWebShellLoginUrl", function () {

            it("includes the database name", function () {

                var dbName = "TestDBName",
                    result = infinityUtilities.getWebShellLoginUrl(dbName),
                    expected = "/MockPath/webui/WebShellLogin.aspx?databaseName=TestDBName&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock";

                expect(result).toBe(expected);

            });

            it("encodes the database name", function () {

                var dbName = "Test#?&DBName",
                    result = infinityUtilities.getWebShellLoginUrl(dbName),
                    expected = "/MockPath/webui/WebShellLogin.aspx?databaseName=Test%23%3F%26DBName&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock";

                expect(result).toBe(expected);

            });

            it("includes the status", function () {

                var dbName = "TestDBName",
                    status = "testing",
                    result = infinityUtilities.getWebShellLoginUrl(dbName, status),
                    expected = "/MockPath/webui/WebShellLogin.aspx?databaseName=TestDBName&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock&status=testing";

                expect(result).toBe(expected);

            });

            it("encodes the status", function () {

                var dbName = "TestDBName",
                    status = "test#?&ing",
                    result = infinityUtilities.getWebShellLoginUrl(dbName, status),
                    expected = "/MockPath/webui/WebShellLogin.aspx?databaseName=TestDBName&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock&status=test%23%3F%26ing";

                expect(result).toBe(expected);

            });

        });

        describe("convertHourMinute", function () {

            it("returns the expected value for midnight", function () {

                var input = "0000",
                    result,
                    expected = "12:00 AM";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("returns the expected value for noon", function () {

                var input = "1200",
                    result,
                    expected = "12:00 PM";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("returns the expected value for before midnight", function () {

                var input = "2359",
                    result,
                    expected = "11:59 PM";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("works with no parameters", function () {

                var result,
                    expected = "";

                result = infinityUtilities.convertHourMinute();

                expect(result).toBe(expected);

            });

            it("works with null parameters", function () {

                var input = null,
                    result,
                    expected = "";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("works with empty parameters", function () {

                var input = "",
                    result,
                    expected = "";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("works with empty HourMinute", function () {

                var input = "    ",
                    result,
                    expected = "";

                result = infinityUtilities.convertHourMinute(input);

                expect(result).toBe(expected);

            });

            it("works with invalid HourMinute", function () {

                var result,
                    expected = "";

                result = infinityUtilities.convertHourMinute("000");
                expect(result).toBe(expected);
                result = infinityUtilities.convertHourMinute("00000");
                expect(result).toBe(expected);
                result = infinityUtilities.convertHourMinute(0);
                expect(result).toBe(expected);

            });

            it("works with invalid time", function () {

                var result,
                    expected = "Invalid date";

                result = infinityUtilities.convertHourMinute("9999");
                expect(result).toBe(expected);

            });

        });

    });

}());
