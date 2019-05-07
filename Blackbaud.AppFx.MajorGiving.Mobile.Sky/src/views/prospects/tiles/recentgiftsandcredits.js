/// <reference path="../../../../bower_components/angular/angular.js" />

/* global angular */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('RecentGiftsAndCreditsController', RecentGiftsAndCreditsController);

    RecentGiftsAndCreditsController.$inject = ['$scope', 'frogApi', 'frogResources', 'bbMoment', 'prospectId'];

    /**
     * The controller for the Recent Gifts and Credits tile on the prospect page. This tile shows the five most recent gifts given by the prospect.
     * 
     * @param {String} prospectId The system ID for the prospect.
     */
    function RecentGiftsAndCreditsController($scope, frogApi, frogResources, bbMoment, prospectId) {
        var locals,
            ukProductId = "9568a6c2-f7aa-45fd-8f54-21fe9654ee2d";

        $scope.frogResources = frogResources;
        $scope.bbMoment = bbMoment;
        $scope.locals = locals = {
            loading: true,
            ukInstalled: false,
            loadAdditionalDetails: loadAdditionalDetails
        };

        function loadGiftsAndCredits() {
            function loadGiftsAndCreditsSuccess(reply) {
                locals.recentGiftsAndCredits = reply.gifts;
            }

            function loadGiftsAndCreditsFailure(reply) {
                locals.loadError = getGeneralErrorMessage(reply);
            }

            function loadGiftsAndCreditsFinally() {
                locals.loading = false;
            }

            frogApi.getRecentGiftsAndCreditsAsync(prospectId, loadGiftsAndCreditsSuccess, loadGiftsAndCreditsFailure, loadGiftsAndCreditsFinally);
        }

        function loadAdditionalDetails(giftId) {
            var gift;

            // Find gift in collection by its ID
            angular.forEach(locals.recentGiftsAndCredits, function (item) {
                if (item.id.toUpperCase() === giftId.toUpperCase()) {
                    gift = item;
                }
            });

            if (gift) {
                // Load details
                frogApi. getAdditionalRevenueDetailsAsync(gift.id)
                    .then(function (response) {
                        gift.detailsLoaded = true;
                        gift.campaigns = (response.campaigns) ? response.campaigns : frogResources.none;
                        gift.revenueCategory = (response.revenueCategory) ? response.revenueCategory : frogResources.none;
                        gift.solicitors = (response.solicitors) ? response.solicitors : frogResources.none;
                        gift.recognitions = (response.recognitions) ? response.recognitions : frogResources.none;
                        gift.opportunity = response.opportunity;
                        gift.appliedTo = response.appliedTo;
                        gift.giftAidStatus = response.giftAidStatus;
                        gift.taxClaimEligibility = response.taxClaimEligibility;
                        gift.taxClaimAmount = response.taxClaimAmount;
                    })
                    .catch(function (error) {
                        locals.detailsLoadError = getGeneralErrorMessage(error);
                    });
            }
        }

        function getGeneralErrorMessage(error) {
            var message = "";

            if (error && error.message) {
                message = error.message;
            }

            return frogResources.error_recentgiftsandcredits_general.format(message);
        }

        loadGiftsAndCredits();

        frogApi.productIsInstalledAsync(ukProductId)
            .then(function (result) {
                locals.ukInstalled = result;
            })
            .catch(function (error) {
                locals.detailsLoadError = getGeneralErrorMessage(error);
            });
    }
}());
