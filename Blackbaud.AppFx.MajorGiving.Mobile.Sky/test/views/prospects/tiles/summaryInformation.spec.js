/// <reference path="../../../../bower_components/angular/angular.js" />

/* jshint jasmine: true */
/* globals module, inject, setTimeout, angular */

(function () {
    'use strict';

    describe('summary information', function () {
        var $rootScope,
            $scope,
            $controller,
            $q,
            getProspectSummaryIsSuccessful,
            getProspectSummaryFailureData,
            summaryInformation,
            waitTime,
            prospectId,
            controller;

        function initializeController() {
            controller = $controller("SummaryInformationController", {
                $scope: $scope,
                prospectId: prospectId
            });
        }

        beforeEach(function () {
            module('frog.api');

            module(function ($provide) {

                function getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback) {

                    finallyCallback = finallyCallback || angular.noop;

                    if (getProspectSummaryIsSuccessful) {
                        successCallback({
                            summaryInformation: summaryInformation
                        });
                    } else {
                        failureCallback(getProspectSummaryFailureData);
                    }

                    finallyCallback();

                }

                function getProspectSummaryAsyncWait(prospectId, successCallback, failureCallback, finallyCallback) {

                    if (waitTime) {
                        setTimeout(function () {
                            getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                        }, waitTime);
                    } else {
                        getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback);
                    }

                }

                $provide.value("api", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getProspectSummaryAsync: getProspectSummaryAsyncWait
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

        describe("SummaryInformationController", function () {

            beforeEach(function () {

                prospectId = "1234";
                controller = null;

                getProspectSummaryIsSuccessful = true;
                getProspectSummaryFailureData = {
                    message: "Test error 1"
                };

                summaryInformation = [
                    {
                        smartFieldName: "Smart Field 1",
                        smartFieldValue: 111.11,
                        bbAutonumericConfig: {
                            aSign: "$",
                            aDec: ".",
                            aSep: ","
                        }
                    }
                ];

                waitTime = 0;

            });

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the gifts", function (done) {

                    waitTime = 2000;

                    initializeController();

                    expect($scope.frogResources).toBeDefined("frogResources");
                    expect($scope.frogResources.summaryinformation_tile_header).toBe("Summary information");
                    expect($scope.frogResources.nosummaryinformation).toBe("No summary information found");
                    expect($scope.frogResources.novalue).toBe("No value");
                    expect($scope.frogResources.error_summaryinformation_general).toBe("Error loading summary information. {0}");

                    expect($scope.locals).toExist("locals");
                    expect($scope.locals.loadError).not.toBeDefined("loadError");
                    expect($scope.locals.summaryInformation).not.toBeDefined("recentGiftsAndCredits");
                    expect($scope.locals.loading).toBe(true, "loading");

                    setTimeout(function () {

                        expect($scope.locals.loading).toBe(false, "loading");
                        expect($scope.locals.loadError).not.toBeDefined("loadError");
                        expect($scope.locals.summaryInformation).toEqual(summaryInformation);

                        done();

                    }, waitTime + 1000);

                });

                it("get summary information failure sets expected values", function () {

                    getProspectSummaryIsSuccessful = false;

                    initializeController();

                    expect($scope.locals.summaryInformation).not.toBeDefined("summaryInformation");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading summary information. Test error 1");

                });

                it("get summary information failure works with no error info", function () {

                    getProspectSummaryIsSuccessful = false;
                    getProspectSummaryFailureData = null;

                    initializeController();

                    expect($scope.locals.summaryInformation).not.toBeDefined("summaryInformation");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading summary information. ");

                });

            });

        });
    });
}());