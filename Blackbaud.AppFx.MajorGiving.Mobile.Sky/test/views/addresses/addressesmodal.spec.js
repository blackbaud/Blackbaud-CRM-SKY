/// <reference path="../../../bower_components/angular/angular.js" />


/*jshint browser: true, jasmine: true */
/*global angular, describe, beforeEach, it, module, inject, expect */

(function () {
    'use strict';

    describe('addresses modal', function () {
        var $rootScope,
            $scope,
            $controller,
            getAddressesIsSuccessful,
            getAddressesFailureData,
            addresses,
            waitTime,
            prospectId,
            controller,
            UIBModalInstance = { close: function () { }, dismiss: function () { } },
            options = [];

        function initializeController() {
            controller = $controller("AddressesModalController", {
                $scope: $scope,
                $uibModalInstance: UIBModalInstance,
                prospectId: prospectId,
                options: options
            });
        }

        beforeEach(function () {
            module('frog.api');

            module(function ($provide) {

                function getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback) {

                    finallyCallback = finallyCallback || angular.noop;

                    if (getAddressesIsSuccessful) {
                        successCallback({
                            addresses: addresses
                        });
                    } else {
                        failureCallback(getAddressesFailureData);
                    }

                    finallyCallback();

                }

                function getAddressesAsyncWait(prospectId, successCallback, failureCallback, finallyCallback) {

                    if (waitTime) {
                        setTimeout(function () {
                            getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                        }, waitTime);
                    } else {
                        getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback);
                    }

                }

                $provide.value("api", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getAddressesListAsync: getAddressesAsyncWait
                });

            });

            module('frog');

        });

        // Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $scope = _$rootScope_.$new();
        }));

        describe("AddressesModalController", function () {

            beforeEach(function () {

                prospectId = "1234";

                controller = null;

                getAddressesIsSuccessful = true;

                getAddressesFailureData = {
                    message: "Test error 1"
                };

                addresses = [
                    {
                        addressType: "Home",
                        isPrimary: true,
                        isConfidential: true,
                        doNotMail: true,
                        description: "1044 E Montague Ave North Charleston SC, 29405"
                    }
                ];

                waitTime = 0;

            });

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the addresses", function (done) {

                    waitTime = 2000;

                    initializeController();

                    expect($scope.frogResources).toBeDefined("frogResources");
                    expect($scope.frogResources.error_addresses_general).toBe("Error loading addresses. {0}");

                    expect($scope.locals).toExist("locals");
                    expect($scope.locals.loadError).not.toBeDefined("loadError");
                    expect($scope.locals.addresses).not.toBeDefined("addresses");
                    expect($scope.locals.loading).toBe(true, "loading");

                    setTimeout(function () {

                        expect($scope.locals.loading).toBe(false, "loading");
                        expect($scope.locals.loadError).not.toBeDefined("loadError");
                        expect($scope.locals.addresses).toEqual(addresses);

                        done();

                    }, waitTime + 1000);

                });

                it("get addresses failure sets expected values", function () {

                    getAddressesIsSuccessful = false;

                    initializeController();

                    expect($scope.locals.addresses).not.toBeDefined("addresses");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading addresses. Test error 1");

                });

                it("get addresses failure works with no error info", function () {

                    getAddressesIsSuccessful = false;
                    getAddressesFailureData = null;

                    initializeController();

                    expect($scope.locals.addresses).not.toBeDefined("addresses");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading addresses. ");

                });

            });

        });

    });

}());