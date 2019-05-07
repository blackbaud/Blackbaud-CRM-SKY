/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPortfolioSettingsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            dataFormLoadResult;

        beforeEach(function () {

            module('frog.resources');

            module('sky.moment');

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataFormLoad: function (dataFormInstanceId) {

                                if (dataFormInstanceId === "cc816f72-b91e-452c-b715-aa15a676e98d") {

                                    if (dataFormLoadIsSuccessful) {

                                        return $q.resolve({
                                            data: dataFormLoadResult
                                        });
                                    }

                                    return $q.reject(dataFormLoadError);
                                }

                                fail("Unknown dataFormLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });

            });

        });

        beforeEach(inject(function (_api_, _$q_, _$timeout_) {
            API = _api_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            dataFormLoadIsSuccessful = true;

            dataFormLoadError = {
                message: "Test error 7"
            };

            dataFormLoadResult = {
                values: [
                    {
                        name: "FILTER_ONLYPRIMARY",
                        value: true
                    },
                    {
                        name: "SORT",
                        value: 1
                    }
                ]
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
                API.getPortfolioSettingsAsync();
                expect(successCallbackCalled).toBe(false);
                expect(failureCallbackCalled).toBe(false);
                expect(finallyCallbackCalled).toBe(false);
                done();
            };

            function checkFirstCallComplete() {
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
                checkFirstCallComplete();
            };
            failureCallback = function () {
                failureCallbackCalled = true;
                checkFirstCallComplete();
            };
            finallyCallback = function () {
                finallyCallbackCalled = true;
                checkFirstCallComplete();
            };

            API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
            $timeout.flush();

        });

        it("successCallback and finallyCallback are called", function (done) {

            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                expect(data).toEqual({
                    onlyPrimary: true,
                    sort: 1
                });
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true);
                done();
            }

            API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
            $timeout.flush();

        });

        it("data form load failure triggers correct behavior", function (done) {

            var failureCallbackCalled = false;

            dataFormLoadIsSuccessful = false;

            function successCallback() {
                fail("successCallback");
            }

            function failureCallback(error) {
                failureCallbackCalled = true;
                expect(error).toEqual({
                    message: "Test error 7"
                });
            }

            function finallyCallback() {
                expect(failureCallbackCalled).toBe(true);
                done();
            }

            API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
            $timeout.flush();

        });

        it("defaults the correct value if results are unexpected", function (done) {

            dataFormLoadResult.values = [];

            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                expect(data).toEqual({
                    onlyPrimary: false,
                    sort: 0
                });
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true);
                done();
            }

            API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
            $timeout.flush();

        });

        it("does not error if results are unexpected", function (done) {

            dataFormLoadResult = null;

            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                expect(data).toEqual({
                    onlyPrimary: false,
                    sort: 0
                });
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true);
                done();
            }

            API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
            $timeout.flush();

        });

        describe("cache", function () {

            it("does not cache success", function (done) {

                var successCallbackCalled = false;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        onlyPrimary: true,
                        sort: 1
                    });
                }

                function successCallback2(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        onlyPrimary: false,
                        sort: 0
                    });
                }

                function failureCallback() {
                    fail("failureCallback");
                }

                function finallyCallback2() {
                    expect(successCallbackCalled).toBe(true);
                    done();
                }

                function finallyCallback() {
                    expect(successCallbackCalled).toBe(true);
                    successCallbackCalled = false;

                    dataFormLoadResult.values = [
                        {
                            name: "FILTER_ONLYPRIMARY",
                            value: false
                        },
                        {
                            name: "SORT",
                            value: 0
                        }
                    ];

                    API.getPortfolioSettingsAsync(successCallback2, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("does not cache failure", function (done) {

                var successCallback2Called = false,
                    failureCallbackCalled = false;

                dataFormLoadIsSuccessful = false;

                function successCallback() {
                    fail("successCallback");
                }

                function successCallback2(data) {
                    successCallback2Called = true;
                    expect(data).toEqual({
                        onlyPrimary: true,
                        sort: 1
                    });
                }

                function failureCallback(error) {
                    failureCallbackCalled = true;
                    expect(error).toEqual({
                        message: "Test error 7"
                    });
                }

                function failureCallback2() {
                    fail("failureCallback");
                }

                function finallyCallback2() {
                    expect(successCallback2Called).toBe(true);
                    done();
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true);
                    dataFormLoadIsSuccessful = true;
                    API.getPortfolioSettingsAsync(successCallback2, failureCallback2, finallyCallback2);
                    $timeout.flush();
                }

                API.getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

    });

}());
