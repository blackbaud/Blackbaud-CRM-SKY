/*jshint jasmine: true */
/*globals inject, module */

(function () {
    'use strict';

    describe('mockableUtilities', function () {

        var mockableUtilities;

        beforeEach(function () {
            module('frog.util');
        });

        beforeEach(inject(function (_mockableUtilities_) {
            mockableUtilities = _mockableUtilities_;
        }));

        it("factory exists", function () {
            expect(mockableUtilities).toBeDefined("factory not defined");
        });

        describe("getWindowLocation", function () {

            it("returns the expected result", function () {

                var actualResult,
                    actualEndString,
                    expectedEndString = ".test.html";

                // this will be something like
                //{
                //    "origin": "file://",
                //    "hash": "",
                //    "href": "file:///C:/Code/CRM/Blackbaud/AppFx/MajorGiving/Mobile.Sky/test/utils/_Chutzpah.ca1c1328569dc88a3c0c32fa04a5efa3.test.html",
                //    "pathname": "/C:/Code/CRM/Blackbaud/AppFx/MajorGiving/Mobile.Sky/test/utils/_Chutzpah.ca1c1328569dc88a3c0c32fa04a5efa3.test.html",
                //    "ancestorOrigins": { "length": 0 },
                //    "hostname": "",
                //    "protocol": "file:",
                //    "port": "",
                //    "host": "", "search": ""
                //}
                actualResult = mockableUtilities.getWindowLocation();

                expect(actualResult).toBeDefined("Nothing was returned.");

                actualResult = actualResult.href;

                expect(actualResult.indexOf(expectedEndString)).toBeGreaterThan(-1);

                actualEndString = actualResult.substring(actualResult.length - expectedEndString.length);

                expect(actualEndString).toBe(expectedEndString);

            });

        });

    });

}());