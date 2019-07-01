/// <reference path="../../../bower_components/angular/angular.js" />

/* jshint jasmine: true */
/* globals module, inject, angular, $ */

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        testUtils,

        state,

        template = "views/addresses/addressesmodal.html",

        AddressesModal = "[bb-frog-testid='addressesModal']",
        AddressesModalHeader = "[bb-frog-testid='addressesHeader']",
        AddressesSuccess = "[bb-frog-testid='addressesSuccess']",
        AddressesList = "[bb-frog-testid='addressesList']",
        AddressesError = "[bb-frog-testid='addressesError']",
        ErrorMessage = "[bb-frog-testid='errorMessage']",

        AddressTypeWithIcon = "[bb-frog-testid='addressTypeWithIcon']",
        PrimaryIcon = "[bb-frog-testid='primaryIcon']",
        ConfidentialIcon = "[bb-frog-testid='confidentialIcon']",
        DoNotMailIcon = "[bb-frog-testid='doNotMailIcon']",
        AddressTypeNoIcon = "[bb-frog-testid='addressTypeNoIcon']",
        AddressLink = "[bb-frog-testid='addressLink']",

        SeasonalDates = "[bb-frog-testid='seasonalDates']",

        Empty = "[bb-frog-testid='empty']";

    function compileFormWithState(controllerState, rootState) {

        controllerState = controllerState || {};

        angular.extend($scope, rootState);
        angular.extend($scope.locals, controllerState);

        var el = angular.element('<div>' + $templateCache.get(template) + '</div>');
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return el;
    }

    /**
     * @private
     *
     * @param {Object} actualAddress
     *
     * @param {Object} expectedAddress
     * @param {String} expectedAddress.addressType
     * @param {String} expectedAddress.description
     * @param {Boolean} expectedAddress.isPrimary
     * @param {Boolean} expectedAddress.isConfidential
     * @param {Boolean} expectedAddress.doNotMail
     * @param {Boolean} expectedAddress.isSeasonal
     * @param {String} expectedAddress.startDate
     * @param {String} expectedAddress.endDate
     * 
     */
    function checkAddress(actualAddress, expectedAddress) {
        var addressTypeWithIcon = actualAddress.find(AddressTypeWithIcon),
            addressTypeNoIcon = actualAddress.find(AddressTypeNoIcon),
            primaryIcon = actualAddress.find(PrimaryIcon),
            confidentialIcon = actualAddress.find(ConfidentialIcon),
            doNotMailIcon = actualAddress.find(DoNotMailIcon),
            addressLink = actualAddress.find(AddressLink),
            seasonalDates = actualAddress.find(SeasonalDates);

        expect(addressLink.text()).toBe(expectedAddress.description);

        if (expectedAddress.isSeasonal) {
            expect(seasonalDates.text()).toBe("Seasonal: " + expectedAddress.startDate + " - " + expectedAddress.endDate);
        } else {
            expect(seasonalDates).not.toExist();
        }

        // Known address type
        if (expectedAddress.addressTypeWithIcon || expectedAddress.addressTypeNoIcon) {
            expect(addressTypeWithIcon.text()).toBe(expectedAddress.addressType);
        }

        // Icons
        if (expectedAddress.isPrimary || expectedAddress.isConfidential || expectedAddress.doNotMail) {
            
            expect(addressTypeNoIcon).not.toExist();

            if (expectedAddress.isPrimary) {
                expect(primaryIcon).toExist();
            }
            if (expectedAddress.isConfidential) {
                expect(confidentialIcon).toExist();
            }
            if (expectedAddress.doNotMail) {
                expect(doNotMailIcon).toExist();
            }

        } else {
            expect(addressTypeWithIcon).not.toExist();
            expect(addressTypeNoIcon).toExist();
        }
    }

    /**
     * @private
     *
     * @param {Object} formDOM
     *
     * @param {Object} expectedState
     * @param {Boolean} [expectedState.loading=false]
     * @param {Boolean} [expectedState.errorMessage]
     *
     * @param {Object[]} [expectedState.addresses]
     * @param {String} expectedState.addresses.addressType
     * @param {String} expectedState.addresses.description
     * @param {Boolean} expectedState.addresses.isPrimary
     * @param {Boolean} expectedState.addresses.isConfidential
     * @param {Boolean} expectedState.addresses.doNotMail
     * @param {Boolean} expectedState.addresses.isSeasonal
     * @param {String} expectedAddress.startDate
     * @param {String} expectedAddress.endDate
     *
     */
    function checkState(formDOM, expectedState) {
        var addressesModal = formDOM.find(AddressesModal),
            addressesHeader = formDOM.find(AddressesModalHeader),
            addressesSuccess = formDOM.find(AddressesSuccess),
            addressesError = formDOM.find(AddressesError),
            errorMessage = formDOM.find(ErrorMessage),
            addresses = formDOM.find(AddressesList),
            wait = addressesModal.find(".blockUI"),
            empty = formDOM.find(Empty),
            addressesList = addresses.find("[data-bbauto-index]"),
            i;

        expectedState = expectedState || {};
        expectedState.addresses = expectedState.addresses || [];

        testUtils.checkHtml(formDOM);

        expect(addressesModal).toExist();

        if (expectedState.errorMessage) {

            expect(addressesSuccess).not.toExist();
            expect(addressesError).toExist();
            expect(errorMessage.text().trim()).toBe(expectedState.errorMessage);
        } else {
            expect(addressesError).not.toExist();

            if (expectedState.loading) {
                expect(wait).toExist();
                expect(wait).toBeVisible();
            } else {
                expect(addressesSuccess).toExist();
                expect(addressesHeader).toExist();
                expect(wait).not.toExist();

                if (expectedState.addresses.length > 0) {

                    expect(addresses).toExist();
                    expect(empty).not.toExist();

                    expect(addressesList.length).toBe(expectedState.addresses.length);

                    for (i = 0; i < addressesList.length; ++i) {
                        checkAddress($(addressesList[i]), expectedState.addresses[i]);
                    }

                } else {
                    expect(addresses).not.toExist();
                    expect(empty).toExist();
                    expect(empty.find(".bb-no-records").text()).toBe("No addresses found");
                }
            }
        }
    }

    beforeEach(function () {
        module("frog.test");
        module("frog");
        module("frog.resources");
        module('infinity.util');
    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _frogResources_, _testUtils_, _bbMoment_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $scope.frogResources = _frogResources_;
        $scope.bbMoment = _bbMoment_;
        testUtils = _testUtils_;
    }));

    beforeEach(function () {
        state = {};
        $scope.locals = {};
    });

    describe('addresses modal html', function () {

        it('displays correctly when error exists', function () {

            var formDOM;

            state.loading = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                loading: true
            });

            $scope.locals.loadError = "Test error 1";

            $rootScope.$digest();

            checkState(formDOM, {
                errorMessage: "Test error 1"
            });

        });

        it('displays correctly when loading', function () {

            var formDOM;

            state.loading = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                loading: true
            });

        });

        it('displays correctly when there are no addresses in list', function () {

            var formDOM;

            state.addresses = [];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                addresses: []
            });

        });

        it('displays correctly when an address has all of the possible information', function () {

            var formDOM;

            state.addresses = [
                {
                    addressType: "Home",
                    isPrimary: true,
                    isConfidential: false,
                    doNotMail: false,
                    description: "501 King Street Charleston, SC 29403",
                    startDate: "02/15",
                    endDate: "04/19",
                    isSeasonal: true
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                addresses: state.addresses
            });

        });

        it('displays correctly when an address has minimal information', function () {

            var formDOM;

            state.addresses = [
                {
                    addressType: "Business",
                    isPrimary: false,
                    isConfidential: false,
                    doNotMail: true,
                    description: "5 Vendue Range" + "\n" + "Charleston, SC 29432",
                    startDate: "0000",
                    endDate: "0000",
                    isSeasonal: false
                },
                {
                    addressType: "Home",
                    isPrimary: true,
                    isConfidential: false,
                    doNotMail: false,
                    description: "6 Chicken Range" + "\n" + "Charleston, SC 29401",
                    startDate: "02/15",
                    endDate: "04/19",
                    isSeasonal: true
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                addresses: state.addresses
            });

        });

    });

}());
