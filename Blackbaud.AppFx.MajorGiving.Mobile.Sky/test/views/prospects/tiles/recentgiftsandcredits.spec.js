/// <reference path="../../../../bower_components/angular/angular.js" />

/* jshint jasmine: true */
/* globals module, inject, setTimeout, angular */

(function () {
    'use strict';

    describe('recent gifts and credits', function () {
        var $rootScope,
            $scope,
            $controller,
            $q,
            getGiftsAndCreditsIsSuccessful,
            getGiftsAndCreditsFailureData,
            getProductIsInstalledIsSuccessful,
            getProductIsInstalledFailureData,
            getAdditionalRevenueDetailsIsSuccessful,
            getAdditionalRevenueDetailsFailureData,
            gifts,
            details,
            waitTime,
            prospectId,
            controller;

        function initializeController() {
            controller = $controller("RecentGiftsAndCreditsController", {
                $scope: $scope,
                prospectId: prospectId
            });
        }

        beforeEach(function () {
            module('infinity.util');
            module('frog.api');

            module(function ($provide) {

                function getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback) {

                    finallyCallback = finallyCallback || angular.noop;

                    if (getGiftsAndCreditsIsSuccessful) {
                        successCallback({
                            gifts: gifts
                        });
                    } else {
                        failureCallback(getGiftsAndCreditsFailureData);
                    }

                    finallyCallback();

                }

                function getRecentGiftsAndCreditsAsyncWait(prospectId, successCallback, failureCallback, finallyCallback) {

                    if (waitTime) {
                        setTimeout(function () {
                            getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                        }, waitTime);
                    } else {
                        getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback);
                    }

                }

                function productIsInstalledAsync(productId) {
                    var deferred = $q.defer();

                    if (getProductIsInstalledIsSuccessful) {
                        // Return true if the product is UK
                        deferred.resolve(productId === "9568a6c2-f7aa-45fd-8f54-21fe9654ee2d");
                    } else {
                        deferred.reject(getProductIsInstalledFailureData);
                    }

                    return deferred.promise;
                }

                function getAdditionalRevenueDetailsAsync(lineItemId) {
                    var deferred = $q.defer();

                    // Satisfy the compiler.
                    // This is used in the real function, but not needed here.
                    lineItemId = lineItemId;

                    if (getAdditionalRevenueDetailsIsSuccessful) {
                        deferred.resolve(details);
                    } else {
                        deferred.reject(getAdditionalRevenueDetailsFailureData);
                    }

                    return deferred.promise;
                }

                $provide.value("api", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getRecentGiftsAndCreditsAsync: getRecentGiftsAndCreditsAsyncWait,
                    productIsInstalledAsync: productIsInstalledAsync,
                    getAdditionalRevenueDetailsAsync: getAdditionalRevenueDetailsAsync
                });

            });

            module('frog');

        });

        // Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_, _$q_) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $q = _$q_;
            $scope = _$rootScope_.$new();
        }));

        describe("RecentGiftsAndCreditsController", function () {

            beforeEach(function () {

                prospectId = "1234";

                controller = null;

                getGiftsAndCreditsIsSuccessful = true;

                getGiftsAndCreditsFailureData = {
                    message: "Test error 1"
                };

                getProductIsInstalledIsSuccessful = true;

                getProductIsInstalledFailureData = {
                    message: "Test error 2"
                };

                getAdditionalRevenueDetailsIsSuccessful = true;

                getAdditionalRevenueDetailsFailureData = {
                    message: "Test error 3"
                };

                gifts = [
                    {
                        id: "0FA416C7-55F2-42E1-B366-D4FA428211D0",
                        amount: 999999.99,
                        date: "9/23/2016",
                        designation: "Awesome Fundraising with really long designation name",
                        applicationType: "Donation ljfdsfs lfds lkjds lkjfds",
                        isRecognitionCredit: true,
                        recognitionCreditType: "What kind of recognition type is has such a long name?",
                        bbAutonumericConfig: {
                            aSign: "$",
                            aDec: ".",
                            aSep: ","
                        }
                    }
                ];

                details = {
                    campaigns: "",
                    revenueCategory: "",
                    solicitors: "",
                    recognitions: ""
                };

                waitTime = 0;

            });

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the gifts", function (done) {

                    waitTime = 2000;

                    initializeController();

                    expect($scope.frogResources).toBeDefined("frogResources");
                    expect($scope.frogResources.recentgiftsandcredits_tile_header).toBe("Recent gifts/credits");
                    expect($scope.frogResources.nogiftsorcredits).toBe("No gifts/credits found");
                    expect($scope.frogResources.error_recentgiftsandcredits_general).toBe("Error loading gifts and credits. {0}");
                    expect($scope.frogResources.recentgiftsandcredits_recognitioncredit).toBe("Recognition credit");
                    expect($scope.frogResources.recentgiftsandcredits_recognitioncreditwithtype).toBe("Recognition credit - {0}");

                    expect($scope.locals).toExist("locals");
                    expect($scope.locals.loadError).not.toBeDefined("loadError");
                    expect($scope.locals.recentGiftsAndCredits).not.toBeDefined("recentGiftsAndCredits");
                    expect($scope.locals.loading).toBe(true, "loading");

                    setTimeout(function () {

                        expect($scope.locals.loading).toBe(false, "loading");
                        expect($scope.locals.loadError).not.toBeDefined("loadError");
                        expect($scope.locals.recentGiftsAndCredits).toEqual(gifts);

                        done();

                    }, waitTime + 1000);

                });

                it("initialize sets blank additional revenue details to the correct value", function () {
                    initializeController();
                    $scope.locals.loadAdditionalDetails($scope.locals.recentGiftsAndCredits[0].id);

                    $rootScope.$digest();

                    expect($scope.locals.recentGiftsAndCredits[0].campaigns).toBe("None");
                    expect($scope.locals.recentGiftsAndCredits[0].revenueCategory).toBe("None");
                    expect($scope.locals.recentGiftsAndCredits[0].solicitors).toBe("None");
                    expect($scope.locals.recentGiftsAndCredits[0].recognitions).toBe("None");
                });

                it("get gifts and credits failure sets expected values", function () {

                    getGiftsAndCreditsIsSuccessful = false;

                    initializeController();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading gifts and credits. Test error 1");

                });

                it("get gifts and credits failure works with no error info", function () {

                    getGiftsAndCreditsIsSuccessful = false;
                    getGiftsAndCreditsFailureData = null;

                    initializeController();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading gifts and credits. ");

                });

                it("get product is installed failure sets expected values", function () {
                    getProductIsInstalledIsSuccessful = false;

                    initializeController();

                    $rootScope.$digest();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.detailsLoadError).toBe("Error loading gifts and credits. Test error 2");
                });

                it("get product is installed failure works with no error info", function () {
                    getProductIsInstalledIsSuccessful = false;
                    getProductIsInstalledFailureData = null;

                    initializeController();

                    $rootScope.$digest();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.detailsLoadError).toBe("Error loading gifts and credits. ");
                });

                it("get additional revenue details failure sets expected values", function () {
                    getAdditionalRevenueDetailsIsSuccessful = false;

                    initializeController();
                    $scope.locals.loadAdditionalDetails($scope.locals.recentGiftsAndCredits[0].id);

                    $rootScope.$digest();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.detailsLoadError).toBe("Error loading gifts and credits. Test error 3");
                });

                it("get additional revenue details failure works with no error info", function () {
                    getAdditionalRevenueDetailsIsSuccessful = false;
                    getAdditionalRevenueDetailsFailureData = null;

                    initializeController();
                    $scope.locals.loadAdditionalDetails($scope.locals.recentGiftsAndCredits[0].id);

                    $rootScope.$digest();

                    expect($scope.locals.gifts).not.toBeDefined("gifts");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.detailsLoadError).toBe("Error loading gifts and credits. ");
                });

            });

        });

    });

}());
