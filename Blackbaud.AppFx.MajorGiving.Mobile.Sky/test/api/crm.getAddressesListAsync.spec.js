/// <reference path="../../bower_components/angular/angular.js" />

/* jshint jasmine: true */
/* globals module, inject */

(function () {
    'use strict';

    describe('crm api getAddressesListAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            addresses;

        beforeEach(function () {

            module('frog.api');

            module("sky.moment");

            module("frog.resources");

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataListLoad: function (dataListId) {

                                if (dataListId === "45fd795a-bfbb-493c-9268-f88c153b66b9") {
                                    if (dataListLoadIsSuccessful) {
                                        var result = [],
                                            address,
                                            config,
                                            i,
                                            n;

                                        for (i = 0, n = addresses.length; i < n; ++i) {
                                            address = addresses[i];
                                            config = address.bbAutonumericConfig;

                                            result.push({
                                                values: [
                                                    address.addressType,
                                                    address.isPrimary ? "1" : "0",
                                                    address.isConfidential ? "1" : "0",
                                                    address.doNotMail ? "1" : "0",
                                                    address.description,
                                                    address.startDate,
                                                    address.endDate,
                                                    address.isSeasonal ? "1" : "0"
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

            addresses = [
                {
                    addressType: "Home",
                    isPrimary: true,
                    isConfidential: false,
                    doNotMail: false,
                    description: "501 King Street Charleston, SC 29403",
                    startDate: "0215",
                    endDate: "0419",
                    isSeasonal: true
                },
                {
                    addressType: "Business",
                    isPrimary: false,
                    isConfidential: true,
                    doNotMail: true,
                    description: "7 2nd Avenue New York, NY 10033",
                    startDate: "0000",
                    endDate: "0000",
                    isSeasonal: false
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
                    API.getAddressesListAsync(prospectId);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("throws error with missing prospectId and failureCallback", function () {

                try {
                    API.getAddressesListAsync();
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        it("has expected result for blank addressType", function (done) {

            addresses[1] =
                {
                    addressType: "",
                    isPrimary: false,
                    isConfidential: true,
                    doNotMail: true,
                    description: "7 2nd Avenue New York, NY 10033",
                    startDate: "0000",
                    endDate: "0000",
                    isSeasonal: false
                };

            var successCallbackCalled = false;

            function successCallback(data) {
                successCallbackCalled = true;
                addresses[1].addressType = "Unknown";
                expect(data).toEqual({
                    addresses: addresses
                });
            }

            function failureCallback() {
                fail("failureCallback");
            }

            function finallyCallback() {
                expect(successCallbackCalled).toBe(true, "successCallback was not called");
                done();
            }

            API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);

            $timeout.flush();

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {

                var successCallbackCalled = false;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        addresses: addresses
                    });
                }

                function failureCallback() {
                    fail("failureCallback");
                }

                function finallyCallback() {
                    expect(successCallbackCalled).toBe(true, "successCallback was not called");
                    done();
                }

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {

                var successCallbackCalled = false,
                    originalAddresses = addresses;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        addresses: originalAddresses
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

                    addresses = [];

                    API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var successCallbackCalled = false,
                    originalAddresses = addresses;

                function successCallback(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        addresses: originalAddresses
                    });

                    data.addresses = [];

                }

                function successCallback2(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        addresses: originalAddresses
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

                    addresses = [];

                    API.getAddressesListAsync(prospectId, successCallback2, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
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
                        addresses: addresses
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
                    API.getAddressesListAsync(prospectId, successCallback2, failureCallback2, finallyCallback2);
                    $timeout.flush();
                }

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("cache does not care about prospectId case", function (done) {

                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                var successCallbackCalled = false,
                    originalAddresses = addresses;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        addresses: originalAddresses
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

                    addresses = [];

                    prospectId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

                    API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

    });

}());
