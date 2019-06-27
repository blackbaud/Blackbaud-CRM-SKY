/* jshint jasmine: true */
/* globals module, inject */

(function () {
    'use strict';

    describe('crm api getRecentGiftsAndCreditsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            gifts;

        beforeEach(function () {

            module('frog.api');

            module("sky.moment");

            module("frog.resources");

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataListLoad: function (dataListId) {

                                if (dataListId === "85943cb8-8aae-4b27-b71a-31ba13942648") {
                                    if (dataListLoadIsSuccessful) {
                                        var result = [],
                                            gift,
                                            config,
                                            i,
                                            n;

                                        for (i = 0, n = gifts.length; i < n; ++i) {
                                            gift = gifts[i];
                                            config = gift.bbAutonumericConfig;

                                            result.push({
                                                values: [
                                                    gift.id,
                                                    gift.amount,
                                                    "currencyId",
                                                    gift.applicationType,
                                                    gift.date,
                                                    gift.designation,
                                                    gift.isRecognitionCredit ? "1" : "0",
                                                    gift.recognitionCreditType,
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

            gifts = [
                {
                    id: "B27234F4-8A44-4A69-A43E-7A315AC0FE3C",
                    amount: 1000,
                    applicationType: "Donation",
                    date: "7/4/1776",
                    designation: "Special Fundraiser",
                    isRecognitionCredit: true,
                    recognitionCreditType: "Spouse",
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ",",
                        aPad: false
                    }
                },
                {
                    id: "7AD07E37-12BA-4ED3-BA7B-7F79BFE1EA80",
                    amount: 2000.20,
                    applicationType: "Gift",
                    date: "7/2/1863",
                    designation: "Extra special fundraiser",
                    isRecognitionCredit: true,
                    recognitionCreditType: null,
                    bbAutonumericConfig: {
                        aSign: "a",
                        aDec: "b",
                        aSep: "c",
                        aPad: true
                    }
                },
                {
                    id: "9DEB77C3-B6C8-4D20-AA1A-117D1F7AF8FD",
                    amount: 3000,
                    applicationType: "Planned gift",
                    date: "7/20/1969",
                    designation: "Plain fundraiser",
                    isRecognitionCredit: true,
                    recognitionCreditType: "Brother",
                    bbAutonumericConfig: {
                        aSign: "d",
                        aDec: "e",
                        aSep: "f",
                        aPad: false
                    }
                },
                {
                    id: "92535D48-128A-43D1-8B40-61D346C97E31",
                    amount: 4000.40,
                    applicationType: "Other",
                    date: "7/1/1863",
                    designation: "Boring fundraiser",
                    isRecognitionCredit: false,
                    recognitionCreditType: null,
                    bbAutonumericConfig: {
                        aSign: "g",
                        aDec: "h",
                        aSep: "i",
                        aPad: true
                    }
                },
                {
                    id: "8416C899-893E-4267-92C9-63405C58E6CB",
                    amount: 5000,
                    applicationType: "Recurring gift",
                    date: "9/26/2016",
                    designation: "Super awesome cannot miss TV fundraiser",
                    isRecognitionCredit: true,
                    recognitionCreditType: "Sister",
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
                    API.getRecentGiftsAndCreditsAsync(prospectId);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("throws error with missing prospectId and failureCallback", function () {

                try {
                    API.getRecentGiftsAndCreditsAsync();
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {

                var successCallbackCalled = false;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        gifts: gifts
                    });
                }

                function failureCallback() {
                    fail("failureCallback");
                }

                function finallyCallback() {
                    expect(successCallbackCalled).toBe(true, "successCallback was not called");
                    done();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("sets ID to upper case value", function (done) {

                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                gifts = [
                    {
                        id: "3d007459-0980-48ca-82bb-ddd3dfe873c2",
                        amount: 1,
                        applicationType: "Donation",
                        date: "1/1/2016",
                        designation: "Cheap",
                        isRecognitionCredit: true,
                        recognitionCreditType: "Credit",
                        bbAutonumericConfig: {
                            aSign: "$",
                            aDec: ".",
                            aSep: ",",
                            aPad: false
                        }
                    }
                ];

                var successCallbackCalled = false;

                function successCallback(data) {
                    successCallbackCalled = true;
                    gifts[0].id = "3D007459-0980-48CA-82BB-DDD3DFE873C2";
                    expect(data).toEqual({
                        gifts: gifts
                    });
                }

                function failureCallback() {
                    fail("failureCallback");
                }

                function finallyCallback() {
                    expect(successCallbackCalled).toBe(true, "successCallback was not called");
                    done();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {

                var successCallbackCalled = false,
                    originalGifts = gifts;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        gifts: originalGifts
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

                    gifts = [];

                    API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var successCallbackCalled = false,
                    originalGifts = gifts;

                function successCallback(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        gifts: originalGifts
                    });

                    data.gifts = [];

                }

                function successCallback2(data) {

                    successCallbackCalled = true;
                    expect(data).toEqual({
                        gifts: originalGifts
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

                    gifts = [];

                    API.getRecentGiftsAndCreditsAsync(prospectId, successCallback2, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
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
                        gifts: gifts
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
                    API.getRecentGiftsAndCreditsAsync(prospectId, successCallback2, failureCallback2, finallyCallback2);
                    $timeout.flush();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

            it("cache does not care about prospectId case", function (done) {

                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                var successCallbackCalled = false,
                    originalGifts = gifts;

                function successCallback(data) {
                    successCallbackCalled = true;
                    expect(data).toEqual({
                        gifts: originalGifts
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

                    gifts = [];

                    prospectId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

                    API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback2);
                    $timeout.flush();
                }

                API.getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                $timeout.flush();

            });

        });

    });

}());
