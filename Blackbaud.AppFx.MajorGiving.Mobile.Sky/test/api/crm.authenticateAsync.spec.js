/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api authenticateAsync', function () {

        var redirectedUrl,
            bbuiShellServiceConfig,
            bbuiShellService,
            API,
            sessionStartStatus,
            userInfo,
            href,
            sessionStartIsSuccessful,
            sessionStartFailureData,
            sessionStartFailureStatus,
            sessionStartFailureHeaders;

        beforeEach(function () {

            redirectedUrl = null;

            module('frog.resources');

            module('sky.moment');

            module('frog.util');

            module('infinity.util');

            module(function ($provide, mockableUtilitiesProvider) {

                var mockUtil = mockableUtilitiesProvider.$get();
                mockUtil.getWindowLocation = function () {
                    return {
                        href: href,
                        replace: function (redirectUrl) {
                            redirectedUrl = redirectUrl;
                        },
                        search: '?' + href.split('?')[1]
                    };
                };
                $provide.value("mockableUtilities", mockUtil);

            });

            module('frog.api');

            module(function ($provide) {

                var testBaseUrl,
                    testDatabaseName,
                    testOptions;

                bbuiShellService = {
                    getTestValues: function () {
                        return {
                            baseUrl: testBaseUrl,
                            databaseName: testDatabaseName,
                            options: testOptions
                        };
                    },
                    create: function (baseUrl, databaseName, options) {

                        testBaseUrl = baseUrl || bbuiShellServiceConfig.baseUrl;
                        testDatabaseName = databaseName || bbuiShellServiceConfig.databaseName;
                        testOptions = options;

                        if (!testDatabaseName) {
                            throw new Error("databaseName Error");
                        }

                        return {
                            baseUrl: "/MockPath",
                            databaseName: "BBInfinityMock",
                            sessionStart: function () {
                                return {

                                    then: function (successCallback) {

                                        if (sessionStartIsSuccessful) {
                                            successCallback(userInfo);
                                        }

                                    },

                                    error: function (failureCallback) {

                                        if (!sessionStartIsSuccessful) {
                                            failureCallback(sessionStartFailureData, sessionStartFailureStatus, sessionStartFailureHeaders);
                                        }

                                    }

                                };
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });

            });

        });

        beforeEach(inject(function (_bbuiShellServiceConfig_, _api_) {
            bbuiShellServiceConfig = _bbuiShellServiceConfig_;
            API = _api_;
        }));

        beforeEach(function () {

            href = "http://MockHost/MockPath/sky/frog/?databaseName=BBInfinityMock";

            API.initialize();

            sessionStartIsSuccessful = true;

            userInfo = {
                data: {
                    id: "85D75DB7-8DC0-4EF1-8D68-280971C93C9D", // app user ID
                    isSysAdmin: false
                }
            };

            sessionStartFailureData = {
                message: "Test error 1"
            };

            sessionStartFailureStatus = 401;

            sessionStartStatus = null;
            sessionStartFailureHeaders = function (header) {
                if (header === "X-BB-FormsAuth") {
                    return sessionStartStatus;
                } else {
                    fail("Unknown header type: " + header);
                }
            };

        });

        it("works with no parameters", function (done) {

            var successCallback,
                failureCallback,
                finallyCallback,
                successCallbackCalled = false,
                failureCallbackCalled = false,
                finallyCallbackCalled = false,
                doTest;

            doTest = function () {
                API.authenticateAsync();
                expect(successCallbackCalled).toBe(false);
                expect(failureCallbackCalled).toBe(false);
                expect(finallyCallbackCalled).toBe(false);
                done();
            };

            function checkInitializationComplete() {
                if (successCallbackCalled && finallyCallbackCalled || failureCallbackCalled && finallyCallbackCalled) {
                    successCallbackCalled = false;
                    failureCallbackCalled = false;
                    finallyCallbackCalled = false;
                    doTest();
                }
            }

            // Set the functions to make sure that old callbacks are
            // not called on the secondary call.
            successCallback = function () {
                successCallbackCalled = true;
                checkInitializationComplete();
            };
            failureCallback = function () {
                failureCallbackCalled = true;
                checkInitializationComplete();
            };
            finallyCallback = function () {
                finallyCallbackCalled = true;
                checkInitializationComplete();
            };

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("sets expected values", function () {

            API.authenticateAsync();

            expect(bbuiShellService.getTestValues().baseUrl).toBe("/MockPath");
            expect(bbuiShellService.getTestValues().databaseName).toBe("bbinfinitymock");
            expect(bbuiShellService.getTestValues().options).toEqual({
                httpHeaders: {
                    "X-BB-FormsAuth": "true"
                }
            });

        });

        it("successCallback and finallyCallback are called", function (done) {

            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                expect(data).toEqual(userInfo.data);
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true);
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("sets ID to upper case value", function (done) {

            userInfo = {
                data: {
                    id: "85d75db7-8dc0-4ef1-8d68-280971c93c9d", // app user ID
                    isSysAdmin: false
                }
            };


            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                userInfo.data.id = "85D75DB7-8DC0-4EF1-8D68-280971C93C9D";
                expect(data).toEqual(userInfo.data);
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true);
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Unauthorized response triggers correct behavior", function (done) {

            sessionStartIsSuccessful = false;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(redirectedUrl).toBe("/MockPath/webui/WebShellLogin.aspx?databaseName=BBInfinityMock&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock");
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Unauthorized response with status triggers correct behavior", function (done) {

            sessionStartIsSuccessful = false;
            sessionStartStatus = "something";

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(redirectedUrl).toBe("/MockPath/webui/WebShellLogin.aspx?databaseName=BBInfinityMock&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock&status=something");
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Not Found response triggers correct behavior", function (done) {

            sessionStartIsSuccessful = false;
            sessionStartFailureStatus = 404;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(redirectedUrl).toBe("/MockPath/webui/WebShellLogin.aspx?databaseName=BBInfinityMock&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock");
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        xit("WS Federation triggers correct behavior", function (done) {

            sessionStartIsSuccessful = false;
            sessionStartFailureStatus = 404;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(redirectedUrl).toBe("/MockPath/webui/WebShellLogin.aspx?databaseName=BBInfinityMock&url=http%3A%2F%2FMockHost%2FMockPath%2Fsky%2Ffrog%2F%3FdatabaseName%3DBBInfinityMock");
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Unexpected response triggers correct behavior", function (done) {

            sessionStartIsSuccessful = false;
            sessionStartFailureStatus = 500;

            var failureCallbackCalled = false;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback(error) {
                failureCallbackCalled = true;
                expect(error).toEqual(sessionStartFailureData);
            }

            function finallyCallback() {
                expect(failureCallbackCalled).toBe(true);
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Unexpected response triggers correct behavior with no message", function (done) {

            sessionStartIsSuccessful = false;
            sessionStartFailureStatus = 500;
            sessionStartFailureData = "Test error 6";

            var failureCallbackCalled = false;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback(error) {
                failureCallbackCalled = true;
                expect(error).toEqual({
                    message: "Test error 6"
                });
            }

            function finallyCallback() {
                expect(failureCallbackCalled).toBe(true);
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

        it("Missing databaseName query string triggers correct behavior", function (done) {

            href = "http://MockHost/MockPath/sky/frog/";

            API.initialize();

            var failureCallbackCalled = false;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback(error) {
                failureCallbackCalled = true;
                expect(error).toEqual(new Error("databaseName Error"));
            }

            function finallyCallback() {
                expect(failureCallbackCalled).toBe(true);
                done();
            }

            API.authenticateAsync(successCallback, failureCallback, finallyCallback);

        });

    });

}());
