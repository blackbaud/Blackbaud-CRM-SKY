/// <reference path="../../../../bower_components/angular/angular.js" />

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

        template = "views/prospects/tiles/summaryinformation.html",

        SummaryInformationTile = "[bb-frog-testid='summaryInformationTile']",
        SummaryInformationSuccess = "[bb-frog-testid='summaryInformationSuccess']",
        SummaryInformationFailure = "[bb-frog-testid='summaryInformationFailure']",
        SummaryInformation = "[bb-frog-testid='summaryInformation']",
        NoSummaryInformation = "[bb-frog-testid='noSummaryInformation']",
        SmartFieldName = "[bb-frog-testid='smartFieldName']",
        SmartFieldValue = "[bb-frog-testid='smartFieldValue']",
        SmartFieldValueNull = "[bb-frog-testid='smartFieldValueNull']";

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
     * @param {Object} actualInfo
     *
     * @param {Object} expectedInfo
     * @param {String} expectedInfo.smartFieldName
     * @param {Number} expectedInfo.smartFieldValue
     *
     * @param {Object} expectedGift.bbAutonumericConfig
     * @param {String} expectedGift.bbAutonumericConfig.aSign
     * @param {String} expectedGift.bbAutonumericConfig.aDec
     * @param {String} expectedGift.bbAutonumericConfig.aSep
     */
    function checkSummaryInformation(actualInfo, expectedInfo) {
        var smartFieldName = actualInfo.find(SmartFieldName),
            smartFieldValue,
            expectedConfig = expectedInfo.bbAutonumericConfig,
            formattingEl;

        expect(smartFieldName.text().trim()).toBe(expectedInfo.smartFieldName);

        if (expectedInfo.smartFieldValue) {
            smartFieldValue = actualInfo.find(SmartFieldValue);

            expectedConfig.aPad = false;
            formattingEl = angular.element('<span>' + expectedInfo.smartFieldValue + '</span>');
            $(formattingEl).autoNumeric('init', expectedConfig);

            expect(smartFieldValue.text().trim()).toBe(formattingEl.text());
        } else {
            smartFieldValue = actualInfo.find(SmartFieldValueNull);

            expect(smartFieldValue.text().trim()).toBe("No value");
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
     * @param {Object[]} [expectedState.summaryInformation]
     * @param {Number} expectedState.summaryInformation.smartFieldName
     * @param {String} expectedState.summaryInformation.smartFieldValue
     * 
     * @param {Object} expectedState.bbAutonumericConfig
     * @param {String} expectedState.bbAutonumericConfig.aSign
     * @param {String} expectedState.bbAutonumericConfig.aDec
     * @param {String} expectedState.bbAutonumericConfig.aSep
     *
     */
    function checkState(formDOM, expectedState) {
        var summaryInformationTile = formDOM.find(SummaryInformationTile),
            summaryInformationSuccess = formDOM.find(SummaryInformationSuccess),
            summaryInformationFailure = formDOM.find(SummaryInformationFailure),
            summaryInformation = formDOM.find(SummaryInformation),
            noSummaryInformation = formDOM.find(NoSummaryInformation),
            wait = summaryInformationTile.find(".blockUI"),
            infoList = summaryInformation.find("[data-bbauto-index]"),
            i;

        expectedState.summaryInformation = expectedState.summaryInformation || [];

        testUtils.checkHtml(formDOM);

        expect(summaryInformationTile).toExist();

        if (expectedState.errorMessage) {
            expect(summaryInformationSuccess).not.toExist();
            expect(summaryInformationFailure).toExist();
        } else {
            if (expectedState.loading) {
                expect(wait).toBeVisible();
            } else {
                expect(summaryInformationSuccess).toExist();
                expect(summaryInformationFailure).not.toExist();

                if (expectedState.summaryInformation.length > 0) {

                    expect(summaryInformation).toExist();
                    expect(noSummaryInformation).not.toExist();

                    expect(infoList.length).toBe(expectedState.summaryInformation.length);

                    for (i = 0; i < infoList.length; ++i) {
                        checkSummaryInformation($(infoList[i]), expectedState.summaryInformation[i]);
                    }

                } else {
                    expect(summaryInformation).not.toExist();
                    expect(noSummaryInformation).toExist();
                    expect(noSummaryInformation.find(".bb-no-records").text()).toBe("No summary information found");
                }
            }
        }
    }

    beforeEach(function () {
        module("frog.test");
        module("frog");
        module("frog.resources");
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

    describe("summary information html", function () {

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

        it('displays correctly when there is no summary information', function () {

            var formDOM;

            state.summaryInformation = [];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                gifts: []
            });

        });

        it('displays correctly when a smart field has all of the possible information', function () {

            var formDOM;

            state.summaryInformation = [
                {
                    smartFieldName: "Smart Field 1",
                    smartFieldValue: 111.11,
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ",",
                        aPad: false
                    }
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                summaryInformation: state.summaryInformation
            });

        });

        it('displays correctly when a smart field has no value', function () {

            var formDOM;

            state.summaryInformation = [
                {
                    smartFieldName: "Smart Field 1",
                    smartFieldValue: null,
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ",",
                        aPad: false
                    }
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                summaryInformation: state.summaryInformation
            });

        });

    });

}());