/// <reference path="../../../../bower_components/angular/angular.js" />

/* global angular */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('SummaryInformationController', SummaryInformationController);

    SummaryInformationController.$inject = ['$scope', 'frogApi', 'frogResources', 'bbMoment', 'prospectId'];

    /**
     * The controller for the Summary Information tile on the prospect page. This tile shows information from up to five revenue Smart Fields associated with the prospect.
     * 
     * @param {String} prospectId The system ID for the prospect.
     */
    function SummaryInformationController($scope, frogApi, frogResources, bbMoment, prospectId) {
        var locals;

        $scope.frogResources = frogResources;
        $scope.bbMoment = bbMoment;
        $scope.locals = locals = {
            loading: true
        };
        frogApi = frogApi;

        function loadSummaryInformation() {
            function loadSummaryInformationSuccess(reply) {
                locals.summaryInformation = reply.summaryInformation;
            }

            function loadSummaryInformationFailure(reply) {
                locals.loadError = getGeneralErrorMessage(reply);
            }

            function loadSummaryInformationFinally() {
                locals.loading = false;
            }

            frogApi.getProspectSummaryAsync(prospectId, loadSummaryInformationSuccess, loadSummaryInformationFailure, loadSummaryInformationFinally);
        }

        function getGeneralErrorMessage(error) {
            var message = "";

            if (error && error.message) {
                message = error.message;
            }

            return frogResources.error_summaryinformation_general.format(message);
        }

        loadSummaryInformation();
    }
}());