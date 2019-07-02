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

        template = "views/prospects/tiles/recentgiftsandcredits.html",

        RecentGiftsAndCreditTile = "[bb-frog-testid='recentGiftsAndCreditsTile']",
        RecentGiftsAndCreditsSuccess = "[bb-frog-testid='recentGiftsAndCreditsSuccess']",
        RecentGiftsAndCreditsError = "[bb-frog-testid='recentGiftsAndCreditsError']",
        AdditionalDetailsSuccess = "[bb-frog-testid='additionalDetailsSuccess']",
        AdditionalDetailsError = "[bb-frog-testid='additionalDetailsError']",
        ErrorMessage = "[bb-frog-testid='errorMessage']",
        AdditionalDetailsErrorMessage = "[bb-frog-testid='additionalDetailsErrorMessage']",
        GiftsAndCredits = "[bb-frog-testid='giftsAndCredits']",
        Empty = "[bb-frog-testid='empty']",

        Amount = "[bb-frog-testid='amount']",
        ApplicationType = "[bb-frog-testid='applicationType']",
        Date = "[bb-frog-testid='date']",
        Designation = "[bb-frog-testid='designation']",
        RecognitionCreditContainer = "[bb-frog-testid='recognitionCreditContainer']",
        RecognitionCredit = "[bb-frog-testid='recognitionCredit']",
        RecognitionCreditWithType = "[bb-frog-testid='recognitionCreditWithType']",

        OpportunityContainer = "[bb-frog-testid='opportunityContainer']",
        AppliedToContainer = "[bb-frog-testid='appliedToContainer']",
        GiftAidStatusContainer = "[bb-frog-testid='giftAidStatusContainer']",
        TaxClaimEligibilityContainer = "[bb-frog-testid='taxClaimEligibilityContainer']",
        TaxClaimAmountContainer = "[bb-frog-testid='taxClaimAmountContainer']";

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
     * @param {Object} actualGift
     *
     * @param {Object} expectedGift
     * @param {Number} expectedGift.amount
     * @param {String} expectedGift.applicationType
     * @param {String} expectedGift.date
     * @param {String} expectedGift.designation
     * @param {Boolean} expectedGift.isRecognitionCredit
     * @param {String} [expectedGift.recognitionCreditType]
     * 
     * @param {Object} expectedGift.bbAutonumericConfig
     * @param {String} expectedGift.bbAutonumericConfig.aSign
     * @param {String} expectedGift.bbAutonumericConfig.aDec
     * @param {String} expectedGift.bbAutonumericConfig.aSep
     */
    function checkGift(formDOM, actualGift, expectedGift) {
        var amount = actualGift.find(Amount),
            applicationType = actualGift.find(ApplicationType),
            date = actualGift.find(Date),
            designation = actualGift.find(Designation),
            additionalDetailsSuccess = formDOM.find(AdditionalDetailsSuccess),
            additionalDetailsError = formDOM.find(AdditionalDetailsError),
            additionalDetailsErrorMessage = formDOM.find(AdditionalDetailsErrorMessage),
            giftAidStatusContainer = actualGift.find(GiftAidStatusContainer),
            taxClaimEligibilityContainer = actualGift.find(TaxClaimEligibilityContainer),
            taxClaimAmountContainer = actualGift.find(TaxClaimAmountContainer),
            recognitionCreditContainer = actualGift.find(RecognitionCreditContainer),
            recognitionCredit = actualGift.find(RecognitionCredit),
            recognitionCreditWithType = actualGift.find(RecognitionCreditWithType),
            expectedConfig = expectedGift.bbAutonumericConfig,
            formattingEl;

        expectedConfig.aPad = false;
        formattingEl = angular.element('<span>' + expectedGift.amount + '</span>');
        $(formattingEl).autoNumeric('init', expectedConfig);

        expect(amount.text()).toBe(formattingEl.text());
        expect(applicationType.text()).toBe(expectedGift.applicationType);
        expect(date.text()).toBe(expectedGift.date);
        expect(designation.text()).toBe(expectedGift.designation);

        if (expectedGift.isRecognitionCredit) {
            expect(recognitionCreditContainer).toExist();

            if (expectedGift.recognitionCreditType) {
                expect(recognitionCredit).not.toExist();
                expect(recognitionCreditWithType).toExist();
                expect(recognitionCreditWithType.text()).toBe("Recognition credit - " + expectedGift.recognitionCreditType);
            } else {
                expect(recognitionCredit).toExist();
                expect(recognitionCreditWithType).not.toExist();
                expect(recognitionCredit.text()).toBe("Recognition credit");
            }
        } else {
            expect(recognitionCreditContainer).not.toExist();
        }

        if (expectedGift.errorMessage) {
            expect(additionalDetailsSuccess).not.toExist();
            expect(additionalDetailsError).toExist();
            expect(additionalDetailsErrorMessage.text().trim()).toBe(expectedGift.errorMessage);
        } else {
            expect(additionalDetailsSuccess).toExist();

            if (state.ukInstalled) {
                expect(giftAidStatusContainer).toExist();
                expect(taxClaimEligibilityContainer).toExist();
                expect(taxClaimAmountContainer).toExist();
            } else {
                expect(giftAidStatusContainer).not.toExist();
                expect(taxClaimEligibilityContainer).not.toExist();
                expect(taxClaimAmountContainer).not.toExist();
            }

            if (expectedGift.opportunity) {
                expect(OpportunityContainer).toExist();
            } else {
                expect(OpportunityContainer).not.toExist();
            }

            if (expectedGift.appliedTo) {
                expect(AppliedToContainer).toExist();
            } else {
                expect(AppliedToContainer).not.toExist();
            }
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
     * @param {Object[]} [expectedState.gifts]
     * @param {Number} expectedState.gifts.amount
     * @param {String} expectedState.gifts.applicationType
     * @param {String} expectedState.gifts.date
     * @param {String} expectedState.gifts.designation
     * @param {Boolean} expectedState.gifts.isRecognitionCredit
     * @param {String} [expectedState.gifts.recognitionCreditType]
     * 
     * @param {Object} expectedState.bbAutonumericConfig
     * @param {String} expectedState.bbAutonumericConfig.aSign
     * @param {String} expectedState.bbAutonumericConfig.aDec
     * @param {String} expectedState.bbAutonumericConfig.aSep
     *
     */
    function checkState(formDOM, expectedState) {
        var recentGiftsAndCreditsTile = formDOM.find(RecentGiftsAndCreditTile),
            recentGiftsAndCreditsSuccess = formDOM.find(RecentGiftsAndCreditsSuccess),
            recentGiftsAndCreditsError = formDOM.find(RecentGiftsAndCreditsError),
            errorMessage = formDOM.find(ErrorMessage),
            gifts = formDOM.find(GiftsAndCredits),
            empty = formDOM.find(Empty),
            wait = recentGiftsAndCreditsTile.find(".blockUI"),
            giftsList = gifts.find("[data-bbauto-index]"),
            i;

        expectedState.gifts = expectedState.gifts || [];

        testUtils.checkHtml(formDOM);

        expect(recentGiftsAndCreditsTile).toExist();

        if (expectedState.errorMessage) {
            expect(recentGiftsAndCreditsSuccess).not.toExist();
            expect(recentGiftsAndCreditsError).toExist();
            expect(errorMessage.text().trim()).toBe(expectedState.errorMessage);
        } else {
            expect(recentGiftsAndCreditsError).not.toExist();

            if (expectedState.loading) {
                expect(wait).toBeVisible();
            } else {
                expect(recentGiftsAndCreditsSuccess).toExist();

                if (expectedState.gifts.length > 0) {

                    expect(gifts).toExist();
                    expect(empty).not.toExist();

                    expect(giftsList.length).toBe(expectedState.gifts.length);

                    for (i = 0; i < giftsList.length; ++i) {
                        checkGift(formDOM, $(giftsList[i]), expectedState.gifts[i]);
                    }

                } else {
                    expect(gifts).not.toExist();
                    expect(empty).toExist();
                    expect(empty.find(".bb-no-records").text()).toBe("No gifts/credits found");
                }
            }
        }
    }

    beforeEach(function () {
        module("frog.test");
        module("infinity.util");
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

    describe('recent gifts and credits html', function () {

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

        it('displays correctly when there are no gifts or credits', function () {

            var formDOM;

            state.recentGiftsAndCredits = [];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                gifts: []
            });

        });

        it('displays correctly when a gift has all of the possible information', function () {

            var formDOM;

            state.recentGiftsAndCredits = [
                {
                    amount: 5000,
                    applicationType: "Donation",
                    date: "9/26/2016",
                    designation: "Special Fundraiser",
                    isRecognitionCredit: true,
                    recognitionCreditType: "Spouse",
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
                gifts: state.recentGiftsAndCredits
            });

        });

        it('displays correctly when a step has minimal information', function () {

            var formDOM;

            state.recentGiftsAndCredits = [
                {
                    amount: 42.42,
                    applicationType: "Donation",
                    date: "9/26/2016",
                    designation: "Special Fundraiser",
                    isRecognitionCredit: false,
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ","
                    }
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                gifts: state.recentGiftsAndCredits
            });

        });

        it('displays as recognition credit even if there is no recognition credit type', function () {

            var formDOM;

            state.recentGiftsAndCredits = [
                {
                    amount: 42.42,
                    applicationType: "Donation",
                    date: "9/26/2016",
                    designation: "Special Fundraiser",
                    isRecognitionCredit: true,
                    bbAutonumericConfig: {
                        aSign: "$",
                        aDec: ".",
                        aSep: ","
                    }
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                gifts: state.recentGiftsAndCredits
            });

        });

        describe('additional revenue details', function () {

            it('displays correctly when UK is unlocked', function () {

                var formDOM;

                state.ukInstalled = true;
                state.recentGiftsAndCredits = [];

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    gifts: []
                });

            });

            it('displays correctly when details fail to load', function () {

                var formDOM;

                state.detailsLoadError = "Test error 1";
                state.recentGiftsAndCredits = [];

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    gifts: []
                });

            });

            it('shows containers when value is returned', function () {

                var formDOM;

                state.recentGiftsAndCredits = [
                    {
                        amount: 42.42,
                        applicationType: "Pledge payment",
                        date: "9/26/2016",
                        designation: "Special Fundraiser",
                        isRecognitionCredit: false,
                        bbAutonumericConfig: {
                            aSign: "$",
                            aDec: ".",
                            aSep: ","
                        },
                        opportunity: "John Smith: $5,000 (Accepted) - 9/1/2016",
                        appliedTo: "9/1/2016 Pledge for John Smith"
                    }
                ];

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    gifts: state.recentGiftsAndCredits
                });

            });

        });

    });

}());
