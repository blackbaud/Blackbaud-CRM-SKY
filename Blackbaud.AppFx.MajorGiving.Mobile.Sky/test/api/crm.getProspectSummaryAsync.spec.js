/* jshint jasmine: true */
/* globals module, inject */

(function () {
    'use strict';

    describe('crm api getProspectSummaryAsync', function () {
        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            summaryInformation;

        beforeEach(function () {
            module('frog.api');
            module("sky.moment");
            module("frog.resources");

            module(function ($provide) {

                bbuiShellService = {

                    create: function () {
                        return {
                            dataListLoad: function (dataListId) {

                                if (dataListId === "2be9ef80-1880-41ed-9b30-9b953183b43e") {
                                    if (dataListLoadIsSuccessful) {
                                        var result = [],
                                            row,
                                            config,
                                            i,
                                            n;

                                        for (i = 0, n = summaryInformation.length; i < n; ++i) {
                                            row = summaryInformation[i];
                                            config = row.bbAutonumericConfig;

                                            result.push({
                                                values: [
                                                    row.smartFieldName,
                                                    row.smartFieldValue,
                                                    "currencyId",
                                                    config.aSign,
                                                    config.aDec,
                                                    config.aSep
                                                ]
                                            });
                                        }

                                        return $q.resolve({
                                            data: {
                                                rows: result
                                            }
                                        });
                                    }

                                    return $q.reject(dataListLoadError);
                                }

                                fail("Unknown dataListLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });

            });

        });

        beforeEach(inject(function (_api_, _bbMoment_, _$q_, _$timeout_) {
            API = _api_;
            bbMoment = _bbMoment_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {
            dataListLoadIsSuccessful = true;

            dataListLoadError = {
                data: {
                    message: "Test error 1"
                }
            };

            prospectId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

            summaryInformation = [
                {
                    smartFieldName: "Smart Field 1",
                    smartFieldValue: 1,
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ",",
                        aPad: false
                    }
                },
                {
                    smartFieldName: "Smart Field 2",
                    smartFieldValue: 0.11,
                    bbAutonumericConfig: {
                        aSign: "a",
                        aDec: "b",
                        aSep: "c",
                        aPad: true
                    }
                },
                {
                    smartFieldName: "Smart Field 3",
                    smartFieldValue: 111,
                    bbAutonumericConfig: {
                        aSign: "d",
                        aDec: "e",
                        aSep: "f",
                        aPad: false
                    }
                },
                {
                    smartFieldName: "Smart Field 4",
                    smartFieldValue: 11.11,
                    bbAutonumericConfig: {
                        aSign: "g",
                        aDec: "h",
                        aSep: "i",
                        aPad: true
                    }
                },
                {
                    smartFieldName: "Smart Field 5",
                    smartFieldValue: 11111,
                    bbAutonumericConfig: {
                        aSign: "j",
                        aDec: "k",
                        aSep: "l",
                        aPad: false
                    }
                }
            ];

        });

        describe("parameters", function () {

            it("works with no callbacks", function (done) {

                var successCallback,
                    failureCallback,
                    finallyCallback,
                    successCallbackCalled = false,
                    finallyCallbackCalled = false;

                function doTest() {
                    API.getProspectSummaryAsync(prospectId);
                    expect(successCallbackCalled).toBe(false);
                    expect(finallyCallbackCalled).toBe(false);
                    done();
                }

                function checkFirstCallComplete() {
                    if (successCallbackCalled && finallyCallbackCalled) {
                        successCallbackCalled = false;
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
                    fail("failureCallback");
                };
                finallyCallback = function () {
                    finallyCallbackCalled = true;
                    checkFirstCallComplete();
                };

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("throws error with missing prospectId and failureCallback", function () {

                try {
                    API.getProspectSummaryAsync();
                    fail("Did not encounter expected exception.");
                } catch (ex) {
                    expect(ex.message).toBe("prospectId is required");
                }

            });

            it("has expected error with null prospectId", function (done) {

                prospectId = null;

                var failureCallbackCalled = false;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(data) {

                    expect(data).toEqual({
                        message: "prospectId is required"
                    });

                    failureCallbackCalled = true;
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true, "failureCallbackCalled");
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("has expected error with undefined prospectId", function (done) {

                prospectId = undefined;

                var failureCallbackCalled = false;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(data) {

                    expect(data).toEqual({
                        message: "prospectId is required"
                    });

                    failureCallbackCalled = true;
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true, "failureCallbackCalled");
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("has expected error with blank prospectId", function (done) {

                prospectId = "";

                var failureCallbackCalled = false;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(data) {

                    expect(data).toEqual({
                        message: "prospectId is required"
                    });

                    failureCallbackCalled = true;
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true, "failureCallbackCalled");
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("has expected error with non-string prospectId", function (done) {

                prospectId = { id: "something" };

                var failureCallbackCalled = false;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(data) {

                    expect(data).toEqual({
                        message: "prospectId is required"
                    });

                    failureCallbackCalled = true;
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true, "failureCallbackCalled");
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {

                var successCallbackCalled = false;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        summaryInformation: summaryInformation
                    });
                }

                function failureCallback() {
                    fail("failureCallback");
                }

                function finallyCallback() {
                    expect(successCallbackCalled).toBe(true, "successCallback was not called");
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("data list load failure triggers correct behavior", function (done) {

                var failureCallbackCalled = false;

                dataListLoadIsSuccessful = false;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(error) {
                    failureCallbackCalled = true;
                    expect(error).toEqual({
                        message: "Test error 1"
                    });
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true);
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("data list load failure with no message triggers correct behavior", function (done) {

                var failureCallbackCalled = false;

                dataListLoadIsSuccessful = false;

                dataListLoadError = {};

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(error) {
                    failureCallbackCalled = true;
                    expect(error).toEqual(dataListLoadError);
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true);
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("data list load failure with no error info triggers correct behavior", function (done) {

                var failureCallbackCalled = false;

                dataListLoadIsSuccessful = false;

                dataListLoadError = null;

                function successCallback() {
                    fail("successCallback");
                }

                function failureCallback(error) {
                    failureCallbackCalled = true;
                    expect(error).toEqual({});
                }

                function finallyCallback() {
                    expect(failureCallbackCalled).toBe(true);
                    done();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {

                var successCallbackCalled = false,
                    originalInfo = summaryInformation;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        summaryInformation: originalInfo
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

                    summaryInformation = [];

                    API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var successCallbackCalled = false,
                    originalInfo = summaryInformation;

                function successCallback(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        summaryInformation: originalInfo
                    });

                    data.summaryInformation = [];

                }

                function successCallback2(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        summaryInformation: originalInfo
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

                    summaryInformation = [];

                    API.getProspectSummaryAsync(prospectId, successCallback2, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("does not cache failure", function (done) {

                var successCallback2Called = false,
                    failureCallbackCalled = false;

                dataListLoadIsSuccessful = false;

                function successCallback() {
                    fail("successCallback");
                }

                function successCallback2(data) {
                    successCallback2Called = true;
                    expect(data).toEqual({
                        summaryInformation: summaryInformation
                    });
                }

                function failureCallback(error) {
                    failureCallbackCalled = true;
                    expect(error).toEqual({
                        message: "Test error 1"
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
                    dataListLoadIsSuccessful = true;
                    API.getProspectSummaryAsync(prospectId, successCallback2, failureCallback2, finallyCallback2);
                    $timeout.flush();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("cache does not care about prospectId case", function (done) {

                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                var successCallbackCalled = false,
                    originalInfo = summaryInformation;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        summaryInformation: originalInfo
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

                    summaryInformation = [];

                    prospectId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

                    API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

    });

}());