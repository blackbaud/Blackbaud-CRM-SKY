/*global angular, console */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('RecentStepsController', RecentStepsController);

    RecentStepsController.$inject = ['$scope', 'bbMoment', 'frogApi', 'frogResources', 'prospectUtilities', 'bbModal', 'bbuiShellService', 'prospectId'];

    /**
     * The controller for the Recent Steps/Interactions tile on the prospect page. This tile shows the five most recent steps/interactions associated with a prospect.
     * 
     * @param {String} prospectId The system ID of the prospect.
     */
    function RecentStepsController($scope, bbMoment, frogApi, frogResources, prospectUtilities, bbModal, bbuiShellService, prospectId) {
        var locals;

        $scope.frogResources = frogResources;
        $scope.openContactReportFromRecentStep = openContactReportFromRecentStep;
        $scope.bbMoment = bbMoment;
        $scope.locals = locals = {
            loading: false,
            grantedInteractionOrStepAddForm: false
        };

        $scope.$on("stepSaved", function () {
            loadSteps();
        });

        function loadSteps() {
            locals.loading = true;

            frogApi.getRecentStepsAsync(prospectId)
                .then(function (response) {
                    locals.recentSteps = response.steps;
                })
                .catch(function (error) {
                    locals.loadError = frogResources.error_loading_steps.format(error.message);
                })
                .finally(function () {
                    locals.loading = false;
                });
        }

        function checkPermissions() {
            var svc = bbuiShellService.create(),
                InteractionOrStepAddFormId = "8eab8484-8188-4e63-a514-e08bea349a05",
                FormFeatureType = 1;

            svc.securityUserGrantedFeature(InteractionOrStepAddFormId, FormFeatureType)
                .then(function (response) {
                    locals.grantedInteractionOrStepAddForm = response.data.granted;
                })
                .catch(function (response) {
                    console.warn("securityUserGrantedFeature failed: " + response.data);
                });
        }

        function openContactReportFromRecentStep(step) {
            var options = {};
            options.prospectId = prospectId;
            options.stepInfo = {
                stepId: step.id,
                contactMethod: step.contactMethod,
                objective: step.objective,
                date: step.date,
                planType: prospectUtilities.PLAN_TYPE.PROSPECT
            };

            if (step.planId) {
                options.editStep = true;
                options.stepInfo.planType = prospectUtilities.PLAN_TYPE.PROSPECT;
                options.stepInfo.planId = step.planId;
            } else {
                options.editInteraction = true;
                options.stepInfo.planType = prospectUtilities.NONE;

            }

            bbModal.open(
                {
                    controller: 'ContactReportController as reportCtrl',
                    templateUrl: 'views/contactreport/contactreport.html',
                    resolve: {
                        options: function () {
                            return options;
                        }
                    }
                }
            );
        }

        function init() {
            loadSteps();
            checkPermissions();
        }

        init();
    }

}());
